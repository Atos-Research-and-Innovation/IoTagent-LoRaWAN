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
var CBOR = require('cbor-sync');

describe('Configuration provisioning API: Provision groups', function() {
    var testMosquittoHost = 'localhost';
    var orionHost = iotAgentConfig.iota.contextBroker.host;
    var orionPort = iotAgentConfig.iota.contextBroker.port;
    var orionServer = orionHost + ':' + orionPort;
    var service = 'smartgondor';
    var subservice = '/gardens';
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

    before(function(done) {
        async.series(
            [
                async.apply(
                    utils.deleteEntityCB,
                    iotAgentConfig.iota.contextBroker,
                    service,
                    subservice,
                    'lora_unprovisioned_device:LoraDeviceGroup'
                ),
                async.apply(
                    utils.deleteEntityCB,
                    iotAgentConfig.iota.contextBroker,
                    service,
                    subservice,
                    'lora_unprovisioned_device2:LoraDeviceGroup'
                ),
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
                async.apply(
                    utils.deleteEntityCB,
                    iotAgentConfig.iota.contextBroker,
                    service,
                    subservice,
                    'lora_unprovisioned_device:LoraDeviceGroup'
                ),
                async.apply(
                    utils.deleteEntityCB,
                    iotAgentConfig.iota.contextBroker,
                    service,
                    subservice,
                    'lora_unprovisioned_device2:LoraDeviceGroup'
                )
            ],
            done
        );
    });

    // TODO: We must fix this in the iotagent_node_lib
    //
    // describe('When a group provisioning request without internalAttributes arrives at the IoT Agent', function () {
    //     var options = {
    //         url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/services',
    //         method: 'POST',
    //         json: utils.readExampleFile('./test/groupProvisioning/provisionGroupTTN_noInternalAttributes.json'),
    //         headers: {
    //             'fiware-service': service,
    //             'fiware-servicepath': subservice
    //         }
    //     };

    //     it('should answer with error', function (done) {
    //         request(options, function (error, response, body) {
    //             should.not.exist(error);
    //             response.should.have.property('statusCode', 500);
    //             done();
    //         });
    //     }); ;
    // });

    describe('When a configuration provisioning request with all the required data arrives to the IoT Agent', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/services',
            method: 'POST',
            json: utils.readExampleFile('./test/groupProvisioning/provisionGroup1TTN.json'),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };
        var devId = 'lora_unprovisioned_device';
        var cbEntityName = devId + ':' + options.json.services[0]['entity_type'];
        var optionsCB = {
            url: 'http://' + orionServer + '/v2/entities/' + cbEntityName,
            method: 'GET',
            json: true,
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        if (testMosquittoHost) {
            /* eslint-disable-next-line  standard/computed-property-even-spacing */
            options.json.services[0]['internal_attributes']['lorawan']['application_server'][
                'host'
            ] = testMosquittoHost;
        }

        var optionsGetService = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/services',
            method: 'GET',
            json: true,
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        it('should add the group to the list', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 201);
                setTimeout(function() {
                    request(optionsGetService, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('count', 1);
                        body.should.have.property('services');
                        body.services.should.have.length(1);
                        body.services[0].should.have.property('entity_type', options.json.services[0]['entity_type']);
                        body.services[0].should.have.property('_id');
                        done();
                    });
                }, 500);
            });
        });

        it('Should register correctly new devices for the group and process their active attributes', function(done) {
            var attributesExample = utils.readExampleFile('./test/activeAttributes/cayenneLpp.json');
            attributesExample['dev_id'] = devId;
            var client = mqtt.connect('mqtt://' + testMosquittoHost);
            client.on('connect', function() {
                client.publish(
                    options.json.services[0]['internal_attributes']['lorawan']['application_id'] +
                        '/devices/' +
                        devId +
                        '/up',
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

        it('Should go on processing active attributes', function(done) {
            var attributesExample = utils.readExampleFile('./test/activeAttributes/cayenneLpp2.json');
            attributesExample['dev_id'] = devId;
            var client = mqtt.connect('mqtt://' + testMosquittoHost);
            client.on('connect', function() {
                client.publish(
                    options.json.services[0]['internal_attributes']['lorawan']['application_id'] +
                        '/devices/' +
                        devId +
                        '/up',
                    JSON.stringify(attributesExample)
                );
                setTimeout(function() {
                    request(optionsCB, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('id', cbEntityName);
                        body.should.have.property('temperature_1');
                        body.temperature_1.should.have.property('type', 'Number');
                        body.temperature_1.should.have.property('value', 21.2);
                        client.end();
                        return done();
                    });
                }, 1000);
            });
        });

        it('should add the device to the devices list', function(done) {
            var optionsGetDevice = {
                url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
                method: 'GET',
                json: true,
                headers: {
                    'fiware-service': service,
                    'fiware-servicepath': subservice
                }
            };
            request(optionsGetDevice, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 200);
                body.should.have.property('count', 1);
                body.should.have.property('devices');
                body.devices.should.be.an('array');
                body.devices.should.have.length(1);
                body.devices[0].should.have.property('device_id', devId);
                body.devices[0].should.have.property('internal_attributes');
                body.devices[0].internal_attributes.should.be.an('array');
                body.devices[0].internal_attributes.should.have.length(1);
                body.devices[0].internal_attributes[0].should.be.an('object');
                body.devices[0].internal_attributes[0].should.have.property('lorawan');
                body.devices[0].internal_attributes[0].lorawan.should.be.an('object');
                body.devices[0].internal_attributes[0].lorawan.should.have.property('dev_eui', '3339343771356214');
                done();
            });
        });
    });

    describe('When a configuration update request arrives to the IOT Agent', function() {
        var options = {
            url:
                'http://localhost:' +
                iotAgentConfig.iota.server.port +
                '/iot/services?resource=70B3D57ED000985F&apikey',
            method: 'PUT',
            json: utils.readExampleFile('./test/groupProvisioning/updateGroup1TTN.json'),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };
        var devId = 'lora_unprovisioned_device';
        var cbEntityName = devId + ':' + 'LoraDeviceGroup';
        var optionsCB = {
            url: 'http://' + orionServer + '/v2/entities/' + cbEntityName,
            method: 'GET',
            json: true,
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        var optionsGetService = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/services',
            method: 'GET',
            json: true,
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };
        it('should update the group in the list', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 204);
                setTimeout(function() {
                    request(optionsGetService, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('count', 1);
                        body.should.have.property('services');
                        body.services.should.have.length(1);
                        body.services[0].should.have.property('_id');
                        body.services[0].should.have.property('attributes');
                        body.services[0].attributes.should.be.an('array');
                        body.services[0].attributes.should.have.length(6);
                        done();
                    });
                }, 500);
            });
        });
        it('Should go on processing active attributes', function(done) {
            var attributesExample = utils.readExampleFile('./test/activeAttributes/cayenneLpp2.json');
            attributesExample['dev_id'] = devId;
            var client = mqtt.connect('mqtt://' + testMosquittoHost);
            client.on('connect', function() {
                client.publish(
                    options.json['internal_attributes']['lorawan']['application_id'] + '/devices/' + devId + '/up',
                    JSON.stringify(attributesExample)
                );
                setTimeout(function() {
                    request(optionsCB, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('id', cbEntityName);
                        body.should.have.property('temperature_1');
                        body.temperature_1.should.have.property('type', 'Number');
                        body.temperature_1.should.have.property('value', 21.2);
                        client.end();
                        return done();
                    });
                }, 1000);
            });
        });
    });

    describe('After a restart', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/services',
            method: 'POST',
            json: utils.readExampleFile('./test/groupProvisioning/provisionGroup1TTN.json'),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };
        it('Should keep on listening to devices from provisioned groups', function(done) {
            var devId = 'lora_unprovisioned_device2';
            var cbEntityName = devId + ':' + options.json.services[0]['entity_type'];
            var optionsCB = {
                url: 'http://' + orionServer + '/v2/entities/' + cbEntityName,
                method: 'GET',
                json: true,
                headers: {
                    'fiware-service': service,
                    'fiware-servicepath': subservice
                }
            };

            async.waterfall([iotagentLora.stop, async.apply(iotagentLora.start, iotAgentConfig)], function(err) {
                should.not.exist(err);
                var attributesExample = utils.readExampleFile('./test/activeAttributes/cayenneLpp3.json');
                attributesExample['dev_id'] = devId;
                var client = mqtt.connect('mqtt://' + testMosquittoHost);
                client.on('connect', function() {
                    client.publish(
                        options.json.services[0]['internal_attributes']['lorawan']['application_id'] +
                            '/devices/' +
                            devId +
                            '/up',
                        JSON.stringify(attributesExample)
                    );
                    setTimeout(function() {
                        request(optionsCB, function(error, response, body) {
                            should.not.exist(error);
                            response.should.have.property('statusCode', 200);
                            body.should.have.property('id', cbEntityName);
                            body.should.have.property('temperature_1');
                            body.temperature_1.should.have.property('type', 'Number');
                            body.temperature_1.should.have.property('value', 28);
                            client.end();
                            return done();
                        });
                    }, 1000);
                });
            });
        });
    });

    describe('When a configuration provisioning request with all the required data arrives to the IoT Agent. CBOR data model', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/services',
            method: 'POST',
            json: utils.readExampleFile('./test/groupProvisioning/provisionGroup1TTNCbor.json'),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };
        var devId = 'lora_unprovisioned_device3';
        var cbEntityName = devId + ':' + options.json.services[0]['entity_type'];
        var optionsCB = {
            url: 'http://' + orionServer + '/v2/entities/' + cbEntityName,
            method: 'GET',
            json: true,
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        if (testMosquittoHost) {
            /* eslint-disable-next-line  standard/computed-property-even-spacing */
            options.json.services[0]['internal_attributes']['lorawan']['application_server'][
                'host'
            ] = testMosquittoHost;
        }

        var optionsGetService = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/services',
            method: 'GET',
            json: true,
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        it('should add the group to the list', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 201);
                setTimeout(function() {
                    request(optionsGetService, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('count', 2);
                        body.should.have.property('services');
                        body.services.should.have.length(2);
                        body.services[1].should.have.property('entity_type', options.json.services[0]['entity_type']);
                        body.services[1].should.have.property('_id');
                        done();
                    });
                }, 500);
            });
        });

        it('Should register correctly new devices for the group and process their active attributes', function(done) {
            var rawJSONPayload = {
                barometric_pressure_0: 0,
                digital_in_3: 100,
                digital_out_4: 0,
                relative_humidity_2: 0,
                temperature_1: 27.2
            };

            var encodedBuffer = CBOR.encode(rawJSONPayload);
            var attributesExample = utils.readExampleFile('./test/activeAttributes/emptyCbor.json');
            attributesExample['payload_raw'] = encodedBuffer.toString('base64');
            attributesExample['dev_id'] = devId;
            var client = mqtt.connect('mqtt://' + testMosquittoHost);
            client.on('connect', function() {
                client.publish(
                    options.json.services[0]['internal_attributes']['lorawan']['application_id'] +
                        '/devices/' +
                        devId +
                        '/up',
                    JSON.stringify(attributesExample)
                );
                setTimeout(function() {
                    request(optionsCB, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('id', cbEntityName);
                        body.should.have.property('barometric_pressure_0');
                        body.temperature_1.should.have.property('type', 'Number');
                        body.temperature_1.should.have.property('value', 27.2);
                        client.end();
                        return done();
                    });
                }, 1000);
            });
        });
    });
    describe('When a group delete request arrives to the Agent', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/services/',
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            },
            method: 'DELETE',
            qs: {
                resource: '70B3D57ED000985F',
                apikey: ''
            }
        };

        var optionsGetService = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/services',
            method: 'GET',
            json: true,
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        it('should return a 204 OK and no errors', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 204);
                done();
            });
        });

        it('should remove the group from the provisioned groups list', function(done) {
            request(optionsGetService, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 200);
                body.should.have.property('count', 1);
                done();
            });
        });

        it('Should unsuscribe from the corresponding MQTT topic', function(done) {
            var optionsCB = {
                url: 'http://' + orionServer + '/v2/entities/LORA-N-005',
                method: 'GET',
                json: true,
                headers: {
                    'fiware-service': service,
                    'fiware-servicepath': subservice
                }
            };
            var attributesExample = utils.readExampleFile('./test/activeAttributes/cayenneLpp.json');
            var client = mqtt.connect('mqtt://' + testMosquittoHost);
            client.on('connect', function() {
                client.publish('ari_ioe_app_demo1/devices/LORA-N-005/up', JSON.stringify(attributesExample));
                setTimeout(function() {
                    request(optionsCB, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 404);
                        client.end();
                        done();
                    });
                }, 500);
            });
        });
    });
});
