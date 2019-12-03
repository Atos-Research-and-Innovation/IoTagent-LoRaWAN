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

const request = require('request');
const async = require('async');
const should = require('chai').should();
const iotAgentConfig = require('../config-test.js');
const utils = require('../utils');
const iotagentLora = require('../../');
const iotAgentLib = require('iotagent-node-lib');
const mqtt = require('mqtt');

describe('Static provisioning', function() {
    let testMosquittoHost = 'localhost';
    let orionHost = iotAgentConfig.iota.contextBroker.host;
    let orionPort = iotAgentConfig.iota.contextBroker.port;
    let orionServer = orionHost + ':' + orionPort;
    const service = 'smartgondor';
    const subservice = '/gardens';
    readEnvVariables();

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
            const sensorType = {
                service: 'factory',
                subservice: '/robots',
                attributes: [
                    {
                        name: 'Battery',
                        type: 'number'
                    }
                ]
            };

            iotAgentConfig.iota.types.Robot = sensorType;
            iotagentLora.start(iotAgentConfig, function(error) {
                should.not.exist(error);
                return done();
            });
        });
    });

    describe('When a new type is provisioned with LoRaWAN configuration', function() {
        let devId;
        let cbEntityName;
        let sensorType;
        let optionsCB;
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
                            username: 'ari_ioe_app_demo1',
                            password: 'ttn-account-v2.UitfM5cPazqW52_zbtgUS6wM5vp1MeLC9Yu-Cozjfp0',
                            provider: 'TTN'
                        },
                        app_eui: '70B3D57ED000985F',
                        application_id: 'ari_ioe_app_demo1',
                        application_key: '9BE6B8EF16415B5F6ED4FBEAFE695C49'
                    }
                }
            };

            devId = 'lora_n_003';
            const type = 'Robot';
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
                sensorType.internalAttributes.lorawan.application_server.host = testMosquittoHost;
            }

            iotAgentConfig.iota.types[type] = sensorType;

            iotagentLora.start(iotAgentConfig, function(error) {
                should.not.exist(error);
                return done();
            });
        });

        it('Should register correctly new devices for the type and process their active attributes', function(done) {
            const attributesExample = utils.readExampleFile('./test/activeAttributes/cayenneLpp.json');
            attributesExample.dev_id = devId;
            const client = mqtt.connect('mqtt://' + testMosquittoHost);
            client.on('connect', function() {
                client.publish(
                    sensorType.internalAttributes.lorawan.application_id + '/devices/' + devId + '/up',
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
            const sensorType = {
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
                            username: 'ari_ioe_app_demo1',
                            password: 'ttn-account-v2.UitfM5cPazqW52_zbtgUS6wM5vp1MeLC9Yu-Cozjfp0',
                            provider: 'TTN'
                        },
                        app_eui: '70B3D57ED000985F',
                        application_id: 'ari_ioe_app_demo1',
                        application_key: '9BE6B8EF16415B5F6ED4FBEAFE695C49'
                    }
                }
            };
            iotAgentConfig.iota.types.Robot2 = sensorType;
            iotagentLora.start(iotAgentConfig, function(error) {
                should.exist(error);
                return done();
            });
        });
    });
});
