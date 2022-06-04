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

/* eslint-disable consistent-return */
/* eslint-disable no-prototype-builtins */

const iotAgentLib = require('iotagent-node-lib');
const finishSouthBoundTransaction = iotAgentLib.finishSouthBoundTransaction;
const confService = require('iotagent-node-lib/lib/services/groups/groupService');
const async = require('async');
const _ = require('lodash');
const config = require('./configService');
const appService = require('./applicationServers/abstractAppService');
const ttnAppService = require('./applicationServers/ttnAppService');
const chirpstackAppService = require('./applicationServers/chirpstackAppService');
const dataTranslation = require('./dataTranslationService');
const context = {
	op: 'IoTAgentLoRaWAN.Agent'
};

let loraApps = [];

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
	}
	const conf = appServer.getIotaConfiguration();
	if (!conf.resource) {
		return callback(null, conf);
	}
	return iotAgentLib.getConfiguration(appServer.getAppId(), '', callback);
}
/**
 * Get an application server using device group parameters
 * @param  {String} service Device group's service
 * @param  {String} subservice Device group's subservice
 * @param  {String} apikey Device group's apikey
 * @param  {String} resource Device group's resource
 */
function getAppByDeviceGroup(service, subservice, apikey, resource) {
	for (const app in loraApps) {
		if (loraApps[app] instanceof appService.AbstractAppService) {
			const iotaConf = loraApps[app].getIotaConfiguration();
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
	let app;
	for (app in loraApps) {
		if (loraApps[app] instanceof appService.AbstractAppService) {
			const iotaConf = loraApps[app].getIotaConfiguration();
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
	let errorMessage;
	if (!appServer) {
		errorMessage = 'Message handler received empty app object';
		config.getLogger().error(context, errorMessage);
		return;
	}

	if (!deviceId) {
		errorMessage = 'Message handler received empty deviceId';
		config.getLogger().error(context, errorMessage);
		return;
	}

	const deviceObject = appServer.getDevice(deviceId);

	if (!deviceObject) {
		config.getLogger().info(context, 'LoRaWAN device unprovisioned');
		config.getLogger().debug(context, 'Looking for group:' + appServer.getAppId());
		async.waterfall(
			[
				async.apply(loadConfigurationFromAppserver, appServer),
				async.apply(registerDeviceFromConfiguration, deviceId, deviceEui)
			],
			function (error, device) {
				if (error) {
					config.getLogger().error(context, error);
					/* when updating a configuration, the link between appserver and device 
						is lost, so the easiest thing to do is re-creating the device */
					if (error.name === 'DUPLICATE_DEVICE_ID') {
						config.getLogger().debug(context, 'attemping to re-create device');
						const configuration = appServer.getIotaConfiguration();
						/* while ideally the best solution is updating the device,
 							with the update some attributes may not be added correctly 
							(this is likely a bug in the iotAgentLib), so we delete
							and re-created the device */
						iotAgentLib.unregister(deviceId, configuration.service, configuration.subservice, function (
							error
						) {
							if (error) {
								config.getLogger().error(context, error);
							} else {
								async.waterfall(
									[
										async.apply(loadConfigurationFromAppserver, appServer),
										async.apply(registerDeviceFromConfiguration, deviceId, deviceEui)
									],
									function (error, device) {
										if (error) {
											config.getLogger().error(context, error);
										} else if (device) {
											appServer.addDevice(device.id, deviceEui, device);
											sendMessage(deviceId, device, message);
										} else {
											errorMessage = 'Unexpected error';
											config.getLogger().error(context, errorMessage);
										}
									}
								);
							}
						});
					}
				} else if (device) {
					appServer.addDevice(device.id, deviceEui, device);
					sendMessage(deviceId, device, message);
				} else {
					errorMessage = 'Unexpected error';
					config.getLogger().error(context, errorMessage);
				}
			}
		);
	} else {
		iotAgentLib.getDevice(deviceId, deviceObject.service, deviceObject.subservice, function (error, device) {
			if (error) {
				errorMessage = 'Error getting IoTA device object';
				config.getLogger().error(context, errorMessage, JSON.stringify(error));
			} else if (device) {
				config.getLogger().info(context, 'IOTA provisioned devices:', JSON.stringify(device));
				sendMessage(deviceId, device, message);
			} else {
				errorMessage = "Couldn't find device data for DeviceId " + deviceId;
				config.getLogger().error(context, errorMessage);
			}
		});
	}
	finishSouthBoundTransaction(null);
}

/**
 * Send Message to Orion
 *
 * @param      {String}    deviceId  The device id
 * @param      {Object}    device  The device sending the message
 * @param      {Object}    message  The message sent
 */
function sendMessage(deviceId, device, message) {
	const ngsiMessage = dataTranslation.toNgsi(message, device);
	if (ngsiMessage && ngsiMessage instanceof Array && ngsiMessage.length > 0) {
		iotAgentLib.update(device.name, device.type, '', ngsiMessage, device, function (iotaError) {
			if (iotaError) {
				const errorMessage = "Couldn't send the updated values to the Context Broker due to an error:";
				config.getLogger().error(context, errorMessage, JSON.stringify(iotaError));
			} else {
				config.getLogger().info(context, 'Observations sent to CB successfully for device ', deviceId);
			}
		});
	} else {
		const errorMessage = 'Could not cast message to NGSI';
		config.getLogger().error(context, errorMessage);
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
	let error;
	let deviceGroup;

	config.getLogger().info(context, 'Registering Application Server:%s', JSON.stringify(appServerConf));

	if (!appServerConf.lorawan) {
		error = 'lorawan attribute must be specified inside internal_attributes';
		config.getLogger().error(context, error);
		return callback(error);
	}

	if (!appServerConf.lorawan.application_server) {
		error = 'lorawan.application_server attribute must be specified inside internal_attributes';
		config.getLogger().error(context, error);
		return callback(error);
	}

	if (!appServerConf.lorawan.application_server.host) {
		error = 'Host for application server is required';
		config.getLogger().error(context, error);
		return callback(error);
	}

	if (!appServerConf.lorawan.application_server.provider) {
		error = 'Provider for application server is required. Supported values: TTN and chirpstack';
		config.getLogger().error(context, error);
		return callback(error);
	}

	if (!appServerConf.lorawan.app_eui) {
		error = 'Missing mandatory configuration attributes for lorawan: app_eui';
		config.getLogger().error(context, error);
		return callback(error);
	}

	if (!appServerConf.lorawan.application_id) {
		error = 'Missing mandatory configuration attributes for lorawan: application_id';
		config.getLogger().error(context, error);
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
		config.getLogger().info(context, 'Updating existing device group configuration');
		removeAppByDeviceGroup(
			deviceGroup.iotaConfiguration.service,
			deviceGroup.iotaConfiguration.subservice,
			deviceGroup.iotaConfiguration.apikey,
			deviceGroup.iotaConfiguration.resource
		);
		deviceGroup.stop();
	}

	for (const app in loraApps) {
		if (loraApps[app] instanceof appService.AbstractAppService) {
			if (loraApps[app].getAppId() === appServerConf.lorawan.app_eui) {
				config.getLogger().debug(context, 'LoRaWAN Application exists');
				if (iotaConfiguration && loraApps[app].getIotaConfiguration()) {
					error = 'Could not assign a new type or service to the LoRaWAN Application';
					config.getLogger().error(context, error);
					return callback(error);
				}
				return callback(null, loraApps[app]);
			}
		}
	}

	config.getLogger().debug(context, 'Creating new LoRaWAN application');
	let newApp = {};
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
	} else if (
		appServerConf.lorawan.application_server.provider === 'loraserver.io' ||
		appServerConf.lorawan.application_server.provider === 'chirpstack'
	) {
		newApp = new chirpstackAppService.ChirpStackService(
			appServerConf.lorawan.application_server,
			appServerConf.lorawan.app_eui,
			appServerConf.lorawan.application_id,
			appServerConf.lorawan.application_key,
			messageHandler,
			appServerConf.lorawan.data_model,
			iotaConfiguration
		);
	} else {
		error = 'Unsupported provider for application server. Supported values: TTN and chirpstack';
		config.getLogger().error(context, error);
		return callback(error);
	}

	if (newApp) {
		newApp.start(function (startError) {
			if (startError) {
				error = 'Error starting App Service';
				config.getLogger().error(context, error);
				return callback(error);
			}
			config.getLogger().info(context, 'Application started.');
			loraApps.push(newApp);
			return callback(null, newApp);
		});
	} else {
		error = 'Error creating TtnBinding';
		config.getLogger().error(context, error);
		return callback(error);
	}
}

/**
 * Stops LoRaWAN application servers
 *
 * @param      {Function}  callback  The callback
 */
function stopApplicationServers(callback) {
	const functions = [];
	for (const app in loraApps) {
		if (loraApps[app] instanceof appService.AbstractAppService) {
			config.getLogger().info(context, 'Stopping App service:%s', loraApps[app].getAppId());
			functions.push(loraApps[app].stop);
		}
	}

	if (functions.length > 0) {
		async.eachSeries(functions, function () {
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
	let error;

	config.getLogger().info(context, 'Configuration provisioning:%s', JSON.stringify(configuration));
	if (!configuration.internalAttributes) {
		error = 'internal_attributes is mandatory to define specific agent configuration';
		config.getLogger().error(context, error);
		error = { message: error };
		return callback(error);
	}
	let lorawanConf = {};
	if (configuration.internalAttributes instanceof Array) {
		for (let i = 0; i < configuration.internalAttributes.length; i++) {
			if (configuration.internalAttributes[i].lorawan) {
				lorawanConf = configuration.internalAttributes[i];
				break;
			}
		}
	} else {
		lorawanConf = configuration.internalAttributes;
	}

	registerApplicationServer(lorawanConf, configuration, function (err, ttnApp) {
		if (err) {
			config.getLogger().error(context, err);
			error = { message: err };
			return callback(error);
		} else if (!ttnApp) {
			error = 'error creating application server';
			config.getLogger().error(context, error);
			error = { message: error };
			return callback(error);
		}
		ttnApp.observeAllDevices();
		return callback(null, configuration);
	});
}

/**
 * It removes a new IOTA configuration
 * @param  {Object} configuration The configuration to be removed
 * @param  {Function} callback The callback
 */
function removeConfiguration(configuration, callback) {
	config.getLogger().info(context, 'Removing configuration:%s', JSON.stringify(configuration));
	const lorawanConf = configuration.internalAttributes[0];
	for (const app in loraApps) {
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
	let error;

	config.getLogger().info(context, 'Device provisioning:%s', JSON.stringify(device));

	if (!device.internalAttributes) {
		error = 'internal_attributes is mandatory to define specific agent configuration';
		config.getLogger().error(context, error);
		error = { message: error };
		return callback(error);
	}

	let lorawanConf = {};
	if (device.internalAttributes instanceof Array) {
		for (let i = 0; i < device.internalAttributes.length; i++) {
			if (device.internalAttributes[i].lorawan) {
				lorawanConf = device.internalAttributes[i];
				break;
			}
		}
	} else {
		lorawanConf = device.internalAttributes;
	}

	registerApplicationServer(lorawanConf, null, function (err, appServer) {
		if (err) {
			config.getLogger().error(context, error);
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
	config.getLogger().info(context, 'Removing device:%s', JSON.stringify(device));
	const lorawanConf = device.internalAttributes;
	for (const app in loraApps) {
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
 * It updates a IoTA device
 * @param  {Object} device The device to be updated
 * @param  {Function} callback The callback
 */
function updateDevice(device, callback) {
	let error;

	config.getLogger().info(context, 'Updating device: %s', JSON.stringify(device));

	if (!device.internalAttributes) {
		error = 'internal_attributes is mandatory to define specific agent configuration';
		config.getLogger().error(context, error);
		error = { message: error };
		return callback(error);
	}

	let lorawanConf = {};
	if (device.internalAttributes instanceof Array) {
		for (let i = 0; i < device.internalAttributes.length; i++) {
			if (device.internalAttributes[i].lorawan) {
				lorawanConf = device.internalAttributes[i];
				break;
			}
		}
	} else {
		lorawanConf = device.internalAttributes;
	}

	for (const app in loraApps) {
		if (loraApps[app] instanceof appService.AbstractAppService) {
			if (loraApps[app].getAppId() === lorawanConf.lorawan.app_eui) {
				delete lorawanConf.lorawan.dev_eui;
				const oldAppServerConf = loraApps[app].getAppServerConf();
				if (oldAppServerConf && !_.isEqual(oldAppServerConf.lorawan, lorawanConf.lorawan)) {
					config.getLogger().info(context, 'configuration changed');
					loraApps[app].setAppServerConf(
						lorawanConf.lorawan.application_server,
						lorawanConf.lorawan.application_id,
						lorawanConf.lorawan.application_key,
						lorawanConf.lorawan.data_model
					);
					loraApps[app].stop();
					loraApps[app].start();
				}
				if (!_.isEqual(loraApps[app].getDevice(device.id), device)) {
					loraApps[app].removeDevice(device.id, lorawanConf.lorawan.dev_eui, device);
					loraApps[app].addDevice(device.id, lorawanConf.lorawan.dev_eui, device);
					iotAgentLib.unregister(device.id, device.service, device.subservice, function (error) {
						if (error) {
							config.getLogger().error(context, error);
						} else {
							iotAgentLib.register(device, callback);
						}
					});
				}
				break;
			}
		}
	}
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
	let newDevice = {};

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
		for (let i = 0; i < newDevice.internalAttributes.length; i++) {
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

	config.getLogger().info(context, 'Loading types from configuration file');
	if (config.getConfig().iota.types) {
		const arrayTypes = [];
		for (const type in config.getConfig().iota.types) {
			if (
				config.getConfig().iota.types[type].internalAttributes &&
				config.getConfig().iota.types[type].internalAttributes.lorawan
			) {
				const newType = config.getConfig().iota.types[type];
				newType.type = type;
				arrayTypes.push(newType);
			}
		}

		async.eachSeries(arrayTypes, registerConfigType, function (err) {
			if (err) {
				config.getLogger().warn(context, 'Error loading services from configuration file', err);
				return callback();
			}
			return callback(null);
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
	config.getLogger().info(context, 'Loading services from registry');
	confService.list(null, 100, 0, function (err, services) {
		if (err) {
			config.getLogger().error(context, 'Error', err);
			callback();
		}
		if (services.count > 0 && services.services.length > 0) {
			async.eachSeries(services.services, registerConfiguration, function (err) {
				if (err) {
					config.getLogger().warn(context, 'Error loading services: %s', err);
					return callback();
				}
				return callback();
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
	config.getLogger().info(context, 'Loading devices from registry');
	iotAgentLib.listDevices(undefined, undefined, undefined, undefined, function (err, devices) {
		if (err) {
			config.getLogger().error(context, 'Error: %s', err);
		}
		if (devices) {
			async.eachSeries(devices.devices, registerDevice, function (err) {
				if (err) {
					config.getLogger().warn(context, 'Error loading devices: %s', err);
					return callback();
				}
				return callback();
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
	config.setLogger(iotAgentLib.logModule);
	config.setConfig(newConfig);
	iotAgentLib.activate(config.getConfig().iota, function (error) {
		if (error) {
			return callback(error);
		}
		config.getLogger().info(context, 'iotagent-node-lib activated');
		//append config JEXL transformation to built in transformations
		iotAgentLib.dataPlugins.expressionTransformation.setJEXLTransforms(newConfig.jexlTransformations);
		iotAgentLib.setProvisioningHandler(registerDevice);
		iotAgentLib.setUpdatingHandler(updateDevice);
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

		async.waterfall([loadTypesFromConfig, loadServices, loadDevices], function (error) {
			if (error) {
				config.getLogger().error(context, error);
				return callback(error);
			}
			return callback();
		});
	});
}

/**
 * Stops the IoT Agent
 *
 * @param      {Function}  callback  The callback
 */
function stop(callback) {
	config.getLogger().info(context, 'Stopping IoT Agent');
	async.series([stopApplicationServers, iotAgentLib.resetMiddlewares, iotAgentLib.deactivate], function () {
		loraApps = [];
		config.getLogger().info(context, 'Agent stopped');
		return callback();
	});
}

/**
 * Shuts down the IoT Agent in a graceful manner
 *
 */
function handleShutdown(signal) {
	config.getLogger().info(context, 'Received %s, starting shutdown processs', signal);
	stop((err) => {
		if (err) {
			config.getLogger().error(context, err);
			return process.exit(1);
		}
		return process.exit(0);
	});
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
process.on('SIGHUP', handleShutdown);

exports.start = start;
exports.stop = stop;
