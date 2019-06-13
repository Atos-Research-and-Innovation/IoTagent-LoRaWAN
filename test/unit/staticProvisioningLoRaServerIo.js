/*
 * Copyright 2019 Atos Spain S.A
 *
 * This file is part of iotagent-lora
 *
 * iotagent-lora is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * iotagent-lora is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with iotagent-lora.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 */

'use strict';

var request = require('request');
var async = require('async');
var should = require('chai').should();
var iotAgentConfig = require('../config-test.js');
var utils = require('../utils');
var iotagentLora = require('../../');
var iotAgentLib = require('iotagent-node-lib');
var mqtt = require('mqtt');

describe('Static provisioning', function() {
    var testMosquittoHost = 'localhost';
    var orionHost = iotAgentConfig.iota.contextBroker.host;
    var orionPort = iotAgentConfig.iota.contextBroker.port;
    var orionServer = orionHost + ':' + orionPort;
    var service = 'smartgondor';
    var subservice = '/gardens';
    readEnvVariables();
    var newConf = JSON.parse(JSON.stringify(iotAgentConfig));

    function readEnvVariables() {
        if (process.env.TEST_MOSQUITTO_HOST) {
            testMosquittoHost = process.env.TEST_MOSQUITTO_HOST;
        }

        if (process.env.IOTA_CB_HOST) {
            orionHost = process.env.IOTA_CB_HOST;
        }

        if (process.env.IOTA_CB_PORT) {
            orionPort = process.env.IOTA_CB_PORT;
        }

        orionServer = orionHost + ':' + orionPort;

        if (process.env.TEST_MONGODB_HOST) {
            iotAgentConfig.iota.mongodb.host = process.env.TEST_MONGODB_HOST;
        }
    }

    beforeEach(function(done) {
        async.series(
            [
                async.apply(
                    utils.deleteEntityCB,
                    iotAgentConfig.iota.contextBroker,
                    service,
                    subservice,
                    'lora_unprovisioned_device:LoraDeviceGroup'
                )
            ],
            done
        );
    });

    afterEach(function(done) {
        async.series(
            [
                iotAgentLib.clearAll,
                iotagentLora.stop,
                async.apply(
                    utils.deleteEntityCB,
                    iotAgentConfig.iota.contextBroker,
                    service,
                    subservice,
                    'lora_unprovisioned_device:LoraDeviceGroup'
                )
            ],
            done
        );
    });

    describe('When a new type is provisioned without LoRaWAN configuration', function() {
        it('Should start the agent without error', function(done) {
            var sensorType = {
                service: 'factory',
                subservice: '/robots',
                attributes: [
                    {
                        name: 'Battery',
                        type: 'number'
                    }
                ]
            };

            newConf.iota.types['Robot'] = sensorType;
            iotagentLora.start(newConf, function(error) {
                should.not.exist(error);
                return done();
            });
        });
    });

    describe('When a new type is provisioned with LoRaWAN configuration', function() {
        var devId;
        var cbEntityName;
        var sensorType;
        var optionsCB;
        it('Should start the agent without error', function(done) {
            sensorType = {
                service: 'factory',
                subservice: '/robots',
                attributes: [
                    {
                        object_id: 'bp0',
                        name: 'barometric_pressure_0',
                        type: 'hpa'
                    },
                    {
                        object_id: 'di3',
                        name: 'digital_in_3',
                        type: 'Number'
                    },
                    {
                        object_id: 'do4',
                        name: 'digital_out_4',
                        type: 'Number'
                    },
                    {
                        object_id: 'rh2',
                        name: 'relative_humidity_2',
                        type: 'Number'
                    },
                    {
                        object_id: 't1',
                        name: 'temperature_1',
                        type: 'Number'
                    }
                ],
                internalAttributes: {
                    lorawan: {
                        application_server: {
                            host: 'localhost',
                            provider: 'loraserver.io'
                        },
                        app_eui: '70B3D57ED000985F',
                        application_id: '1',
                        application_key: '9BE6B8EF16415B5F6ED4FBEAFE695C49'
                    }
                }
            };

            devId = 'lora_n_003';
            var type = 'Robot';
            cbEntityName = devId + ':' + type;
            optionsCB = {
                url: 'http://' + orionServer + '/v2/entities/' + cbEntityName,
                method: 'GET',
                json: true,
                headers: {
                    'fiware-service': sensorType.service,
                    'fiware-servicepath': sensorType.subservice
                }
            };

            if (testMosquittoHost) {
                sensorType['internalAttributes']['lorawan']['application_server']['host'] = testMosquittoHost;
            }

            newConf.iota.types[type] = sensorType;

            iotagentLora.start(newConf, function(error) {
                should.not.exist(error);
                return done();
            });
        });

        it('Should register correctly new devices for the type and process their active attributes', function(done) {
            var attributesExample = utils.readExampleFile('./test/activeAttributes/cayenneLppLoRaServerIo.json');
            attributesExample['deviceName'] = devId;
            var client = mqtt.connect('mqtt://' + testMosquittoHost);
            client.on('connect', function() {
                client.publish(
                    'application/' +
                        sensorType['internalAttributes']['lorawan']['application_id'] +
                        '/device/' +
                        attributesExample.devEUI +
                        '/rx',
                    JSON.stringify(attributesExample)
                );
                setTimeout(function() {
                    request(optionsCB, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('id', cbEntityName);
                        body.should.have.property('temperature_1');
                        body.temperature_1.should.have.property('type', 'Number');
                        body.temperature_1.should.have.property('value', 27.2);
                        client.end();
                        return done();
                    });
                }, 1000);
            });
        });
    });

    describe('When a new type is provisioned with LoRaWAN configuration but the application server has been already used for other type', function() {
        it('Should not start the agent', function(done) {
            var sensorType = {
                service: 'factory',
                subservice: '/robots',
                attributes: [
                    {
                        name: 'Battery',
                        type: 'number'
                    }
                ],
                internalAttributes: {
                    lorawan: {
                        application_server: {
                            host: 'localhost',
                            provider: 'loraserver.io'
                        },
                        app_eui: '70B3D57ED000985F',
                        application_id: '1',
                        application_key: '9BE6B8EF16415B5F6ED4FBEAFE695C49'
                    }
                }
            };

            newConf.iota.types['Robot2'] = sensorType;
            iotagentLora.start(newConf, function(error) {
                should.exist(error);
                return done();
            });
        });
    });
});
