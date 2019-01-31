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

describe('Device provisioning API: Provision devices', function() {
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
                async.apply(utils.deleteEntityCB, iotAgentConfig.iota.contextBroker, service, subservice, 'LORA-N-003'),
                async.apply(utils.deleteEntityCB, iotAgentConfig.iota.contextBroker, service, subservice, 'LORA-N-001'),
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
                async.apply(utils.deleteEntityCB, iotAgentConfig.iota.contextBroker, service, subservice, 'LORA-N-001')
            ],
            done
        );
    });

    describe('When a device provisioning request without internalAttributes arrives at the IoT Agent', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
            method: 'POST',
            json: utils.readExampleFile('./test/deviceProvisioning/provisionDeviceTTN_noInternalAttributes.json'),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        it('should answer with error', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 500);
                done();
            });
        });
    });

    describe('When a device provisioning request without lorawan property arrives at the IoT Agent', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
            method: 'POST',
            json: utils.readExampleFile('./test/deviceProvisioning/provisionDeviceTTN_noLorawan.json'),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        it('should answer with error', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 500);
                done();
            });
        });
    });

    describe('When a device provisioning request without application_server property arrives at the IoT Agent', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
            method: 'POST',
            json: utils.readExampleFile('./test/deviceProvisioning/provisionDeviceTTN_noApplicationServer.json'),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        it('should answer with error', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 500);
                done();
            });
        });
    });

    describe('When a device provisioning request without application_server host property arrives at the IoT Agent', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
            method: 'POST',
            json: utils.readExampleFile('./test/deviceProvisioning/provisionDeviceTTN_noApplicationServerHost.json'),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        it('should answer with error', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 500);
                done();
            });
        });
    });

    describe('When a device provisioning request without application_server provider property arrives at the IoT Agent', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
            method: 'POST',
            json: utils.readExampleFile(
                './test/deviceProvisioning/provisionDeviceTTN_noApplicationServerProvider.json'
            ),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        it('should answer with error', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 500);
                done();
            });
        });
    });

    describe('When a device provisioning request without mandatory properties arrives at the IoT Agent', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
            method: 'POST',
            json: utils.readExampleFile('./test/deviceProvisioning/provisionDeviceTTN_noMandatoryProperties.json'),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        it('should answer with error', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 500);
                done();
            });
        });
    });

    describe('When a device provisioning request with all the required data arrives to the IoT Agent', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
            method: 'POST',
            json: utils.readExampleFile('./test/deviceProvisioning/provisionDevice1TTN.json'),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        if (testMosquittoHost) {
            options.json.devices[0]['internal_attributes']['lorawan']['application_server']['host'] = testMosquittoHost;
        }

        var optionsGetDevice = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
            method: 'GET',
            json: true,
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        var optionsCB = {
            url: 'http://' + orionServer + '/v2/entities/' + options.json.devices[0]['entity_name'],
            method: 'GET',
            json: true,
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        it('should add the device to the devices list', function(done) {
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
                        body.devices[0].should.have.property('device_id', options.json.devices[0]['device_id']);
                        done();
                    });
                }, 500);
            });
        });

        it('should register the entity in the CB', function(done) {
            request(optionsCB, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 200);
                body.should.have.property('id', options.json.devices[0]['entity_name']);
                done();
            });
        });

        it('Should process correctly active attributes', function(done) {
            var attributesExample = utils.readExampleFile('./test/activeAttributes/cayenneLpp.json');
            var client = mqtt.connect('mqtt://' + testMosquittoHost);
            client.on('connect', function() {
                client.publish(
                    options.json.devices[0]['internal_attributes']['lorawan']['application_id'] +
                        '/devices/' +
                        options.json.devices[0]['device_id'] +
                        '/up',
                    JSON.stringify(attributesExample)
                );
                setTimeout(function() {
                    request(optionsCB, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('id', options.json.devices[0]['entity_name']);
                        body.should.have.property('temperature_1');
                        body.temperature_1.should.have.property('type', 'Number');
                        body.temperature_1.should.have.property('value', 27.2);
                        client.end();
                        done();
                    });
                }, 500);
            });
        });
    });

    describe('When a device provisioning request with all the required data arrives to the IoT Agent and the Application Server already exists', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
            method: 'POST',
            json: utils.readExampleFile('./test/deviceProvisioning/provisionDevice2TTN.json'),
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        if (testMosquittoHost) {
            options.json.devices[0]['internal_attributes']['lorawan']['application_server']['host'] = testMosquittoHost;
        }

        var optionsGetDevice = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
            method: 'GET',
            json: true,
            headers: {
                'fiware-service': 'smartgondor',
                'fiware-servicepath': '/gardens'
            }
        };

        var optionsCB = {
            url: 'http://' + orionServer + '/v2/entities/' + options.json.devices[0]['entity_name'],
            method: 'GET',
            json: true,
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            }
        };

        it('should add the device to the devices list', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 201);
                setTimeout(function() {
                    request(optionsGetDevice, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('count', 2);
                        body.should.have.property('devices');
                        body.devices.should.be.an('array');
                        body.devices.should.have.length(2);
                        body.devices[1].should.have.property('device_id', options.json.devices[0]['device_id']);
                        done();
                    });
                }, 500);
            });
        });

        it('should register the entity in the CB', function(done) {
            request(optionsCB, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 200);
                body.should.have.property('id', options.json.devices[0]['entity_name']);
                done();
            });
        });

        it('Should process correctly active attributes', function(done) {
            var attributesExample = utils.readExampleFile('./test/activeAttributes/cayenneLpp2.json');
            var client = mqtt.connect('mqtt://' + testMosquittoHost);
            client.on('connect', function() {
                client.publish(
                    options.json.devices[0]['internal_attributes']['lorawan']['application_id'] +
                        '/devices/' +
                        options.json.devices[0]['device_id'] +
                        '/up',
                    JSON.stringify(attributesExample)
                );
                setTimeout(function() {
                    request(optionsCB, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('id', options.json.devices[0]['entity_name']);
                        body.should.have.property('temperature_1');
                        body.temperature_1.should.have.property('type', 'Number');
                        body.temperature_1.should.have.property('value', 21.2);
                        client.end();
                        done();
                    });
                }, 500);
            });
        });
    });

    describe('Active attributes are reported but bad payload is received', function() {
        it('Should process correctly active attributes', function(done) {
            var attributesExample = utils.readExampleFile('./test/activeAttributes/cayenneLpp_bad_json.json', true);
            var client = mqtt.connect('mqtt://' + testMosquittoHost);
            client.on('connect', function() {
                client.publish('ari_ioe_app_demo1/devices/lora_n_003/up', JSON.stringify(attributesExample));
                setTimeout(function() {
                    client.end();
                    done();
                }, 500);
            });
        });

        it('Should process correctly active attributes', function(done) {
            var attributesExample = utils.readExampleFile('./test/activeAttributes/cayenneLpp_bad_raw.json', true);
            var client = mqtt.connect('mqtt://' + testMosquittoHost);
            client.on('connect', function() {
                client.publish('ari_ioe_app_demo1/devices/lora_n_003/up', JSON.stringify(attributesExample));
                setTimeout(function() {
                    client.end();
                    done();
                }, 500);
            });
        });
    });

    describe('After a restart', function() {
        it('Should keep on listening to active attributes from provisioned devices', function(done) {
            var optionsCB = {
                url: 'http://' + orionServer + '/v2/entities/LORA-N-003',
                method: 'GET',
                json: true,
                headers: {
                    'fiware-service': service,
                    'fiware-servicepath': subservice
                }
            };
            var attributesExample = utils.readExampleFile('./test/activeAttributes/cayenneLpp3.json');
            async.waterfall([iotagentLora.stop, async.apply(iotagentLora.start, iotAgentConfig)], function(err) {
                should.not.exist(err);
                var client = mqtt.connect('mqtt://' + testMosquittoHost);
                client.on('connect', function() {
                    client.publish('ari_ioe_app_demo1/devices/lora_n_003/up', JSON.stringify(attributesExample));
                    setTimeout(function() {
                        request(optionsCB, function(error, response, body) {
                            should.not.exist(error);
                            response.should.have.property('statusCode', 200);
                            body.should.have.property('id', 'LORA-N-003');
                            body.should.have.property('temperature_1');
                            body.temperature_1.should.have.property('type', 'Number');
                            body.temperature_1.should.have.property('value', 28);
                            client.end();
                            done();
                        });
                    }, 500);
                });
            });
        });
    });

    describe('When a device delete request arrives to the Agent', function() {
        var options = {
            url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices/lora_n_003',
            headers: {
                'fiware-service': service,
                'fiware-servicepath': subservice
            },
            method: 'DELETE'
        };

        it('should return a 204 OK and no errors', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.should.have.property('statusCode', 204);
                done();
            });
        });

        it('should remove the device from the provisioned devices list', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                var options = {
                    url: 'http://localhost:' + iotAgentConfig.iota.server.port + '/iot/devices',
                    headers: {
                        'fiware-service': service,
                        'fiware-servicepath': subservice
                    },
                    json: true,
                    method: 'GET'
                };

                request(options, function(error, response, body) {
                    should.not.exist(error);
                    response.should.have.property('statusCode', 200);
                    body.should.have.property('count', 1);
                    body.should.have.property('devices');
                    body.devices.should.have.length(1);
                    done();
                });
            });
        });

        it('Should unsuscribe from the corresponding MQTT topic', function(done) {
            var optionsCB = {
                url: 'http://' + orionServer + '/v2/entities/LORA-N-003',
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
                client.publish('ari_ioe_app_demo1/devices/LORA-N-003/up', JSON.stringify(attributesExample));
                setTimeout(function() {
                    request(optionsCB, function(error, response, body) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        body.should.have.property('id', 'LORA-N-003');
                        body.should.have.property('temperature_1');
                        body.temperature_1.should.be.an('object');
                        body.temperature_1.should.have.property('type', 'Number');
                        body.temperature_1.should.have.property('value', 28);
                        client.end();
                        done();
                    });
                }, 500);
            });
        });
    });
});
