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

var iotAgentLib = require('iotagent-node-lib');
var confService = require('iotagent-node-lib/lib/services/groups/groupService');
var winston = require('winston');
var async = require('async');
var config = require('./configService');
var appService = require('./applicationServers/abstractAppService');
var ttnAppService = require('./applicationServers/ttnAppService');
var loraserverioAppService = require('./applicationServers/loraserverioAppService');
var dataTranslation = require('./dataTranslationService');

var loraApps = [];

/**
 * Loads a cofiguration.
 *
 * @param      {<type>}    appServer  The application server
 * @param      {Function}  callback   The callback
 * @return     {<type>}    { description_of_the_return_value }
 */
function loadConfigurationFromAppserver(appServer, callback) {
    if (!appServer.getIotaConfiguration()) {
        return iotAgentLib.getConfiguration(appServer.getAppId(), '', callback);
    } else {
        var conf = appServer.getIotaConfiguration();
        if (!conf.resource) {
            return callback(null, conf);
        } else {
            return iotAgentLib.getConfiguration(appServer.getAppId(), '', callback);
        }
    }
}
/**
 * Get an application server using device group parameters
 * @param  {String} service Device group's service
 * @param  {String} subservice Device group's subservice
 * @param  {String} apikey Device group's apikey
 * @param  {String} resource Device group's resource
 */
function getAppByDeviceGroup(service, subservice, apikey, resource) {
    for (var app in loraApps) {
        if (loraApps[app] instanceof appService.AbstractAppService) {
            let iotaConf = loraApps[app].getIotaConfiguration();
            if (
                iotaConf.service === service &&
                iotaConf.subservice === subservice &&
                iotaConf.apikey === apikey &&
                iotaConf.resource === resource
            ) {
                return loraApps[app];
            }
        }
    }

    return null;
}

/**
 * Removes an application server using device group parameters
 *
 * @param  {String} service Device group's service
 * @param  {String} subservice Device group's subservice
 * @param  {String} apikey Device group's apikey
 * @param  {String} resource Device group's resource
 */
function removeAppByDeviceGroup(service, subservice, apikey, resource) {
    let appToRemove;
    for (var app in loraApps) {
        if (loraApps[app] instanceof appService.AbstractAppService) {
            let iotaConf = loraApps[app].getIotaConfiguration();
            if (
                iotaConf.service === service &&
                iotaConf.subservice === subservice &&
                iotaConf.apikey === apikey &&
                iotaConf.resource === resource
            ) {
                appToRemove = app;
                break;
            }
        }
    }

    if (appToRemove) {
        delete loraApps[app];
    }
    return null;
}

/**
 * It handles new messages comming from the LoRaWAN application servers
 *
 * @param      {Object}  appServer  The application server
 * @param      {string}  deviceId   The device identifier
 * @param      {string}  deviceEui  The device EUI
 * @param      {Object}  message    The message
 */
function messageHandler(appServer, deviceId, deviceEui, message) {
    var errorMessage;
    if (!appServer) {
        errorMessage = 'Message handler received empty app object';
        winston.error(errorMessage);
        return;
    }

    if (!deviceId) {
        errorMessage = 'Message handler received empty deviceId';
        winston.error(errorMessage);
        return;
    }

    var deviceObject = appServer.getDevice(deviceId);

    if (!deviceObject) {
        winston.info('LoRaWAN device unprovisioned');
        winston.debug('Looking for group:' + appServer.getAppId());
        async.waterfall(
            [
                async.apply(loadConfigurationFromAppserver, appServer),
                async.apply(registerDeviceFromConfiguration, deviceId, deviceEui)
            ],
            function(error, device) {
                if (error) {
                    winston.error(error);
                } else if (device) {
                    appServer.addDevice(device.id, deviceEui, device);
                    var ngsiMessage = dataTranslation.toNgsi(message, device);
                    if (ngsiMessage && ngsiMessage instanceof Array && ngsiMessage.length > 0) {
                        iotAgentLib.update(device.name, device.type, '', ngsiMessage, device, function(iotaError) {
                            if (iotaError) {
                                errorMessage =
                                    "Couldn't send the updated values to the Context Broker due to an error:";
                                winston.error(errorMessage, JSON.stringify(iotaError));
                            } else {
                                winston.info('Observations sent to CB successfully for device ', deviceId);
                            }
                        });
                    } else {
                        errorMessage = 'Could not cast message to NGSI';
                        winston.error(errorMessage);
                    }
                } else {
                    errorMessage = 'Unexpected error';
                    winston.error(errorMessage);
                }
            }
        );
    } else {
        iotAgentLib.getDevice(deviceId, deviceObject.service, deviceObject.subservice, function(error, device) {
            if (error) {
                errorMessage = 'Error getting IoTA device object';
                winston.error(errorMessage, JSON.stringify(error));
            } else if (device) {
                winston.info('IOTA provisioned devices:', JSON.stringify(device));
                var ngsiMessage = dataTranslation.toNgsi(message, device);
                if (ngsiMessage && ngsiMessage instanceof Array && ngsiMessage.length > 0) {
                    iotAgentLib.update(device.name, device.type, '', ngsiMessage, device, function(iotaError) {
                        if (iotaError) {
                            errorMessage = "Couldn't send the updated values to the Context Broker due to an error:";
                            winston.error(errorMessage, JSON.stringify(iotaError));
                        } else {
                            winston.info('Observations sent to CB successfully for device ', deviceId);
                        }
                    });
                } else {
                    errorMessage = 'Could not cast message to NGSI';
                    winston.error(errorMessage);
                }
            } else {
                errorMessage = "Couldn't find device data for DeviceId " + deviceId;
                winston.error(errorMessage);
            }
        });
    }
}

/**
 * It registers a new LoRaWAN application server
 *
 * @param      {Object}    appServerConf  The application server conf
 * @param      {Object}    iotaConfiguration  The IOTA configuration associated to this application server
 * @param      {Function}  callback       The callback
 */
function registerApplicationServer(appServerConf, iotaConfiguration, callback) {
    var error;
    var deviceGroup;

    winston.info('Registering Application Server:%s', JSON.stringify(appServerConf));

    if (!appServerConf.lorawan) {
        error = 'lorawan attribute must be specified inside internal_attributes';
        winston.error(error);
        return callback(error);
    }

    if (!appServerConf.lorawan.application_server) {
        error = 'lorawan.application_server attribute must be specified inside internal_attributes';
        winston.error(error);
        return callback(error);
    }

    if (!appServerConf.lorawan.application_server.host) {
        error = 'Host for application server is required';
        winston.error(error);
        return callback(error);
    }

    if (!appServerConf.lorawan.application_server.provider) {
        error = 'Provider for application server is required. Supported values: TTN and loraserver.io';
        winston.error(error);
        return callback(error);
    }

    if (!appServerConf.lorawan.app_eui) {
        error = 'Missing mandatory configuration attributes for lorawan: app_eui';
        winston.error(error);
        return callback(error);
    }

    if (!appServerConf.lorawan.application_id) {
        error = 'Missing mandatory configuration attributes for lorawan: application_id';
        winston.error(error);
        return callback(error);
    }

    if (iotaConfiguration) {
        deviceGroup = getAppByDeviceGroup(
            iotaConfiguration.service,
            iotaConfiguration.subservice,
            iotaConfiguration.apikey,
            iotaConfiguration.resource
        );
    }

    if (
        deviceGroup &&
        deviceGroup.iotaConfiguration.hasOwnProperty('apikey') &&
        deviceGroup.iotaConfiguration.hasOwnProperty('resource')
    ) {
        winston.info('Updating existing device group configuration');
        removeAppByDeviceGroup(
            deviceGroup.iotaConfiguration.service,
            deviceGroup.iotaConfiguration.subservice,
            deviceGroup.iotaConfiguration.apikey,
            deviceGroup.iotaConfiguration.resource
        );
        deviceGroup.stop();
    }

    for (var app in loraApps) {
        if (loraApps[app] instanceof appService.AbstractAppService) {
            if (loraApps[app].getAppId() === appServerConf.lorawan.app_eui) {
                winston.info('LoRaWAN Application exists');
                if (iotaConfiguration && loraApps[app].getIotaConfiguration()) {
                    error = 'Could not assign a new type or service to the LoRaWAN Application';
                    winston.error(error);
                    return callback(error);
                } else {
                    return callback(null, loraApps[app]);
                }
            }
        }
    }

    winston.info('Creating new LoRaWAN application');
    var newApp = {};
    if (appServerConf.lorawan.application_server.provider === 'TTN') {
        newApp = new ttnAppService.TtnAppService(
            appServerConf.lorawan.application_server,
            appServerConf.lorawan.app_eui,
            appServerConf.lorawan.application_id,
            appServerConf.lorawan.application_key,
            messageHandler,
            appServerConf.lorawan.data_model,
            iotaConfiguration
        );
    } else if (appServerConf.lorawan.application_server.provider === 'loraserver.io') {
        newApp = new loraserverioAppService.LoraserverIoService(
            appServerConf.lorawan.application_server,
            appServerConf.lorawan.app_eui,
            appServerConf.lorawan.application_id,
            appServerConf.lorawan.application_key,
            messageHandler,
            appServerConf.lorawan.data_model,
            iotaConfiguration
        );
    } else {
        error = 'Unsupported provider for application server. Supported values: TTN and loraserver.io';
        winston.error(error);
        return callback(error);
    }

    if (newApp) {
        newApp.start(function(startError) {
            if (startError) {
                error = 'Error starting App Service';
                winston.error(error);
                return callback(error);
            }
            winston.info('Application started.');
            loraApps.push(newApp);
            return callback(null, newApp);
        });
    } else {
        error = 'Error creating TtnBinding';
        winston.error(error);
        return callback(error);
    }
}

/**
 * Stops LoRaWAN application servers
 *
 * @param      {Function}  callback  The callback
 */
function stopApplicationServers(callback) {
    var functions = [];
    for (var app in loraApps) {
        if (loraApps[app] instanceof appService.AbstractAppService) {
            winston.info('Stopping App service:%s', loraApps[app].getAppId());
            functions.push(loraApps[app].stop);
        }
    }

    if (functions.length > 0) {
        async.eachSeries(functions, function() {
            return callback();
        });
    } else {
        return callback();
    }
}

/**
 * It registers a new IOTA configuration
 *
 * @param      {Object}    configuration  The configuration
 * @param      {Function}  callback       The callback
 */
function registerConfiguration(configuration, callback) {
    var error;

    winston.info('Configuration provisioning:%s', JSON.stringify(configuration));
    if (!configuration.internalAttributes) {
        error = 'internal_attributes is mandatory to define specific agent configuration';
        winston.error(error);
        error = { message: error };
        return callback(error);
    } else {
        var lorawanConf = {};
        if (configuration.internalAttributes instanceof Array) {
            for (var i = 0; i < configuration.internalAttributes.length; i++) {
                if (configuration.internalAttributes[i].lorawan) {
                    lorawanConf = configuration.internalAttributes[i];
                    break;
                }
            }
        } else {
            lorawanConf = configuration.internalAttributes;
        }

        registerApplicationServer(lorawanConf, configuration, function(err, ttnApp) {
            if (err) {
                winston.error(err);
                error = { message: err };
                return callback(error);
            } else if (!ttnApp) {
                error = 'error creating application server';
                winston.error(error);
                error = { message: error };
                return callback(error);
            } else {
                ttnApp.observeAllDevices();
                return callback(null, configuration);
            }
        });
    }
}

/**
 * It removes a new IOTA configuration
 * @param  {Object} configuration The configuration to be removed
 * @param  {Function} callback The callback
 */
function removeConfiguration(configuration, callback) {
    winston.info('Removing configuration:%s', JSON.stringify(configuration));
    var lorawanConf = configuration.internalAttributes[0];
    for (var app in loraApps) {
        if (loraApps[app] instanceof appService.AbstractAppService) {
            if (loraApps[app].getAppId() === lorawanConf.lorawan.app_eui) {
                loraApps[app].stop();
                delete loraApps[app];
                break;
            }
        }
    }

    callback(null, configuration);
}

/**
 * It registers a new IoTA device
 *
 * @param      {Object}    device    The device
 * @param      {Function}  callback  The callback
 */
function registerDevice(device, callback) {
    var error;

    winston.info('Device provisioning:%s', JSON.stringify(device));

    if (!device.internalAttributes) {
        error = 'internal_attributes is mandatory to define specific agent configuration';
        winston.error(error);
        error = { message: error };
        return callback(error);
    }

    var lorawanConf = {};
    if (device.internalAttributes instanceof Array) {
        for (var i = 0; i < device.internalAttributes.length; i++) {
            if (device.internalAttributes[i].lorawan) {
                lorawanConf = device.internalAttributes[i];
                break;
            }
        }
    } else {
        lorawanConf = device.internalAttributes;
    }

    registerApplicationServer(lorawanConf, null, function(err, appServer) {
        if (err) {
            winston.error(error);
            error = { message: error };
            return callback(error);
        }

        appServer.addDevice(device.id, lorawanConf.lorawan.dev_eui, device);
        return callback(null, device);
    });
}

/**
 * It removes a new IoTA device
 * @param  {Object} device The device to be removed
 * @param  {Function} callback The callback
 */
function removeDevice(device, callback) {
    winston.info('Removing device:%s', JSON.stringify(device));
    var lorawanConf = device.internalAttributes;
    for (var app in loraApps) {
        if (loraApps[app] instanceof appService.AbstractAppService) {
            if (loraApps[app].getAppId() === lorawanConf.lorawan.app_eui) {
                loraApps[app].removeDevice(device.id, lorawanConf.lorawan.dev_eui, device);
                break;
            }
        }
    }

    return callback(null, device);
}

/**
 * It registers a new device using an already registered configuration
 *
 * @param      {string}    deviceId       The device identifier
 * @param      {string}    deviceEUI      The device EUI
 * @param      {Object}    configuration  The configuration
 * @param      {Function}  callback       The callback
 */
function registerDeviceFromConfiguration(deviceId, deviceEUI, configuration, callback) {
    var newDevice = {};

    newDevice = {
        id: deviceId,
        name: deviceId + ':' + configuration.type,
        type: configuration.type,
        service: configuration.service,
        subservice: configuration.subservice,
        lazy: configuration.lazy,
        active: configuration.attributes,
        commands: configuration.commands,
        internalAttributes: configuration.internalAttributes
    };

    if (newDevice.internalAttributes instanceof Array) {
        for (var i = 0; i < newDevice.internalAttributes.length; i++) {
            if (newDevice.internalAttributes[i].lorawan) {
                newDevice.internalAttributes[i].lorawan.dev_eui = deviceEUI;
                break;
            }
        }
    } else {
        newDevice.internalAttributes.lorawan.dev_eui = deviceEUI;
    }

    iotAgentLib.register(newDevice, callback);
}

/**
 * Loads a types from configuration.
 *
 * @param      {Function}  callback  The callback
 */
function loadTypesFromConfig(callback) {
    function registerConfigType(type, callback) {
        if (type) {
            registerConfiguration(type, callback);
        } else {
            return callback(null);
        }
    }

    winston.info('Loading types from configuration file');
    if (config.getConfig().iota.types) {
        var arrayTypes = [];
        for (var type in config.getConfig().iota.types) {
            if (
                config.getConfig().iota.types[type].internalAttributes &&
                config.getConfig().iota.types[type].internalAttributes.lorawan
            ) {
                var newType = config.getConfig().iota.types[type];
                newType['type'] = type;
                arrayTypes.push(newType);
            }
        }

        async.eachSeries(arrayTypes, registerConfigType, function(err) {
            if (err) {
                winston.warn('Error loading services from configuration file', err);
                return callback();
            } else {
                return callback(null);
            }
        });
    } else {
        return callback(null);
    }
}

/**
 * Loads services.
 *
 * @param      {Function}  callback  The callback
 */
function loadServices(callback) {
    winston.info('Loading services from registry');
    confService.list(null, 100, 0, function(err, services) {
        if (err) {
            winston.error('Error', err);
            callback();
        }
        if (services.count > 0 && services.services.length > 0) {
            async.eachSeries(services.services, registerConfiguration, function(err) {
                if (err) {
                    winston.warn('Error loading services', err);
                    return callback();
                } else {
                    return callback();
                }
            });
        } else {
            return callback();
        }
    });
}

/**
 * Loads devices from memory. This function is used during the boostrap process
 *
 * @param      {Function}  callback  The callback
 */
function loadDevices(callback) {
    winston.info('Loading devices from registry');
    iotAgentLib.listDevices(undefined, undefined, undefined, undefined, function(err, devices) {
        if (err) {
            winston.error('Error', err);
        }
        if (devices) {
            async.eachSeries(devices.devices, registerDevice, function(err) {
                if (err) {
                    winston.warn('Error loading devices', err);
                    return callback();
                } else {
                    return callback();
                }
            });
        }
    });
}

/**
 * Starts the IoT Agent
 *
 * @param      {<type>}    newConfig  The new configuration
 * @param      {Function}  callback   The callback
 */
function start(newConfig, callback) {
    config.setConfig(newConfig);
    iotAgentLib.activate(config.getConfig().iota, function(error) {
        if (error) {
            return callback(error);
        } else {
            winston.info('iotagent-node-lib activated');
            iotAgentLib.setProvisioningHandler(registerDevice);
            iotAgentLib.setRemoveDeviceHandler(removeDevice);
            iotAgentLib.setConfigurationHandler(registerConfiguration);
            iotAgentLib.setRemoveConfigurationHandler(removeConfiguration);

            // Enables all the plugins
            iotAgentLib.addUpdateMiddleware(iotAgentLib.dataPlugins.attributeAlias.update);
            iotAgentLib.addUpdateMiddleware(iotAgentLib.dataPlugins.addEvents.update);
            iotAgentLib.addUpdateMiddleware(iotAgentLib.dataPlugins.expressionTransformation.update);
            iotAgentLib.addUpdateMiddleware(iotAgentLib.dataPlugins.multiEntity.update);
            iotAgentLib.addUpdateMiddleware(iotAgentLib.dataPlugins.timestampProcess.update);

            iotAgentLib.addDeviceProvisionMiddleware(iotAgentLib.dataPlugins.bidirectionalData.deviceProvision);
            iotAgentLib.addConfigurationProvisionMiddleware(iotAgentLib.dataPlugins.bidirectionalData.groupProvision);
            iotAgentLib.addNotificationMiddleware(iotAgentLib.dataPlugins.bidirectionalData.notification);

            async.waterfall([loadTypesFromConfig, loadServices, loadDevices], function(error) {
                if (error) {
                    winston.error(error);
                    return callback(error);
                } else {
                    return callback();
                }
            });
        }
    });
}

/**
 * Stops the IoT Agent
 *
 * @param      {Function}  callback  The callback
 */
function stop(callback) {
    winston.info('Stopping IoT Agent');
    async.series([stopApplicationServers, iotAgentLib.resetMiddlewares, iotAgentLib.deactivate], function() {
        loraApps = [];
        winston.info('Agent stopped');
        return callback();
    });
}

exports.start = start;
exports.stop = stop;
