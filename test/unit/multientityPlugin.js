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

/* eslint-disable no-unused-vars */

const request = require('request');
const async = require('async');
const should = require('chai').should();
const iotAgentConfig = require('../config-test.js');
const utils = require('../utils');
const iotagentLora = require('../../');
const iotAgentLib = require('iotagent-node-lib');
const mqtt = require('mqtt');
const CBOR = require('cbor-sync');

describe('Multientity plugin', function() {
    let testMosquittoHost = 'localhost';
    let orionHost = iotAgentConfig.iota.contextBroker.host;
    let orionPort = iotAgentConfig.iota.contextBroker.port;
    let orionServer = orionHost + ':' + orionPort;
    const service = 'smartgondor';
    const subservice = '/gardens';

    function readEnvVariables() {
        if (process.env.TEST_MOSQUITTO_HOST) {
            testMosquittoHost = process.env.TEST_MOSQUITTO_HOST;
        }

        if (process.env.IOTA_CB_HOST) {
            orionHost = process.env.IOTA_CB_HOST;
            iotAgentConfig.iota.contextBroker.host = orionHost;
        }

        if (process.env.IOTA_CB_PORT) {
            orionPort = process.env.IOTA_CB_PORT;
            iotAgentConfig.iota.contextBroker.port = orionPort;
        }

        orionServer = orionHost + ':' + orionPort;

        if (process.env.TEST_MONGODB_HOST) {
            iotAgentConfig.iota.mongodb.host = process.env.TEST_MONGODB_HOST;
        }
    }

    before(function(done) {
        readEnvVariables();
        async.series(
            [
                async.apply(utils.deleteEntityCB, iotAgentConfig.iota.contextBroker, service, subservice, 'LORA-N-003'),
                async.apply(utils.deleteEntityCB, iotAgentConfig.iota.contextBroker, service, subservice, 'Mote001'),
                async.apply(iotagentLora.start, iotAgentConfig)
            ],
            done
        );
    });

    after(function(done) {
        async.series(
            [
                iotAgentLib.clearAll,
                iotagentLora.stop,
                async.apply(utils.deleteEntityCB, iotAgentConfig.iota.contextBroker, service, subservice, 'LORA-N-003'),
                async.apply(utils.deleteEntityCB, iotAgentConfig.iota.contextBroker, service, subservice, 'Mote001')
            ],
            done
        );
    });

    describe('When a device provisioning request with all the required data arrives to the IoT Agent. Multientity plugin', function() {
        const multientityName = 'Mote001';
        const multientityType = 'Mote';
        before(function(done) {
            const createEntityCB = {
                url: 'http://' + orionServer + '/v2/entities/',
                method: 'POST',
                json: {
                    id: multientityName,
                    type: multientityType,
                    temperature_1: {
                        type: 'Number',
                        value: 0
                    }
                },
                headers: {
                    'fiware-service': service,
                    'fiware-servicepath': subservice
                }
            };

            request(createEntityCB, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 201);
                done();
            });
        });

        const options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
            method: 'POST',
            json: utils.readExampleFile('./test/deviceProvisioning/provisionDeviceMultientityPluginTTN.json'),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };
        const optionsGetDevice = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
            method: 'GET',
            json: true,
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        it('should add the device to the devices list', function(done) {
            if (testMosquittoHost) {
                /* eslint-disable-next-line  standard/computed-property-even-spacing */
                options.json.devices[0].internal_attributes.lorawan.application_server.host = testMosquittoHost;
            }

            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 201);
                setTimeout(function() {
                    request(optionsGetDevice, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('count', 1);
                        body.should.have.property('devices');
                        body.devices.should.be.an('array');
                        body.devices.should.have.length(1);
                        body.devices[0].should.have.property('device_id', options.json.devices[0].device_id);
                        done();
                    });
                }, 500);
            });
        });

        it('should register the entity in the CB', function(done) {
            const optionsCB = {
                url: 'http://' + orionServer + '/v2/entities/' + options.json.devices[0].entity_name,
                method: 'GET',
                json: true,
                headers: {
                    'fiware-service': service,
                    'fiware-servicepath': subservice
                }
            };

            request(optionsCB, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 200);
                body.should.have.property('id', options.json.devices[0].entity_name);
                done();
            });
        });

        it('Should process correctly active attributes represented in CBOR model', function(done) {
            const rawJSONPayload = {
                barometric_pressure_0: 0,
                digital_in_3: 101,
                digital_out_4: 0,
                relative_humidity_2: 0,
                temperature_1: 27.2
            };

            const optionsCB = {
                url: 'http://' + orionServer + '/v2/entities/' + options.json.devices[0].entity_name,
                method: 'GET',
                json: true,
                headers: {
                    'fiware-service': service,
                    'fiware-servicepath': subservice
                }
            };

            const optionsCBMultiEntity = {
                url: 'http://' + orionServer + '/v2/entities/' + multientityName,
                method: 'GET',
                json: true,
                headers: {
                    'fiware-service': service,
                    'fiware-servicepath': subservice
                }
            };

            const encodedBuffer = CBOR.encode(rawJSONPayload);
            const attributesExample = utils.readExampleFile('./test/activeAttributes/emptyCbor.json');
            attributesExample.payload_raw = encodedBuffer.toString('base64');
            const client = mqtt.connect('mqtt://' + testMosquittoHost);
            client.on('connect', function() {
                client.publish(
                    options.json.devices[0].internal_attributes.lorawan.application_id +
                        '/devices/' +
                        options.json.devices[0].device_id +
                        '/up',
                    JSON.stringify(attributesExample)
                );
                setTimeout(function() {
                    request(optionsCB, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('id', options.json.devices[0].entity_name);
                        body.should.have.property('digital_in_3');
                        body.digital_in_3.should.have.property('type', 'Number');
                        body.digital_in_3.should.have.property('value', 101);
                        request(optionsCBMultiEntity, function(error, response, body) {
                            should.not.exist(error);
                            response.should.have.property('statusCode', 200);
                            body.should.have.property('id', multientityName);
                            body.should.have.property('temperature_1');
                            body.temperature_1.should.have.property('type', 'Number');
                            body.temperature_1.should.have.property('value', 27.2);
                            client.end();
                            done();
                        });
                    });
                }, 500);
            });
        });
    });
});
