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

const config = require('../configService');
const appService = require('./abstractAppService');
const mqttClient = require('../bindings/mqttClient');
const iotAgentLib = require('iotagent-node-lib');
const regenerateTransid = iotAgentLib.regenerateTransid;
const intoTrans = iotAgentLib.intoTrans;
const context = {
	op: 'IoTAgentLoRaWAN.ChirpStackService'
};
const _ = require('lodash');

/**
 *Class that represents a LoRaServer.io LoRaWAN app server
 */
class ChirpStackService extends appService.AbstractAppService {
	/**
	 * Constructs the object.
	 *
	 * @param      {String}  applicationServer  The application server
	 * @param      {String}  appEui             The application eui
	 * @param      {String}  applicationId      The application identifier
	 * @param      {String}  applicationKey     The application key
	 * @param      {Function}  messageHandler     The message handler
	 * @param      {String}  dataModel     The data model
	 * @param      {Object}  iotaConfiguration     The IOTA configuration associated to this Application Server.
	 */
	constructor(
		applicationServer,
		appEui,
		applicationId,
		applicationKey,
		messageHandler,
		dataModel,
		iotaConfiguration
	) {
		if (!applicationId) {
			throw new Error('applicationId is mandatory for LoRaServer');
		}

		super(applicationServer, appEui, applicationId, applicationKey, messageHandler, dataModel, iotaConfiguration);
	}

	/**
	 * It starts the TTN Application Service interface
	 *
	 * @param      {Function}  callback  The callback
	 */
	start(callback) {
		this.preProcessMessage = this.preProcessMessage.bind(this);
		this.mqttClient = new mqttClient.MqttClient(
			this.applicationServer.host,
			this.applicationServer.port,
			this.applicationServer.protocol,
			this.applicationServer.username,
			this.applicationServer.password,
			this.applicationServer.options,
			this.preProcessMessage,
			this.applicationId
		);

		this.mqttClient.start(callback);
	}

	/**
	 * It stops the TTN Application Service interface
	 *
	 * @param      {Function}  callback  The callback
	 */
	stop(callback) {
		this.stopObserveAllDevices();
		this.mqttClient.stop(callback);
	}

	/**
	 * It processes a message received from a TTN Application Service
	 *
	 * @param      {<type>}  mqttTopic  The mqtt topic
	 * @param      {<type>}  message    The message
	 */
	preProcessMessage(mqttTopic, message) {
		regenerateTransid(mqttTopic);
		config.getLogger().info(context, 'New message in topic', mqttTopic);
		config.getLogger().debug(context, 'Message', JSON.stringify(message));

		const splittedMqttTopic = mqttTopic.split('/');
		if (splittedMqttTopic.length !== 6) {
			const errorMessage = 'Bad format for a LoRaServer.io topic';
			config.getLogger().error(context, errorMessage);
		} else {
			// var appId = splittedMqttTopic[0];
			const devEui = splittedMqttTopic[3];
			const device = this.getDeviceByEui(devEui);
			try {
				message = JSON.parse(message);
			} catch (e) {
				config.getLogger().error(context, 'Error decoding message:' + e);
				message = null;
				return;
			}

			const dataModel = this.getDataModel(null, message.devEUI);
			const localContext = _.clone(context);

			let deviceId;
			if (device) {
				deviceId = device.id;
				localContext.srv = device.service;
				localContext.subsrv = device.subservice;
			} else if (message && message.deviceName) {
				deviceId = message.deviceName;
			}

			if (message) {
				if (dataModel === 'application_server' && message.object) {
					intoTrans(localContext, this.messageHandler)(this, deviceId, message.devEUI, message.object);
				} else if (dataModel !== 'application_server' && message.data) {
					intoTrans(localContext, this.messageHandler)(this, deviceId, message.devEUI, message.data);
				}
			}
		}
	}

	/**
	 * It observes a new device. Abstract method
	 *
	 * @param      {string}  devId         The development identifier
	 * @param      {String}  devEUI         The development identifier
	 * @param      {<type>}  deviceObject  The device object
	 */
	observeDevice(devId, devEUI, deviceObject) {
		if (!devEUI) {
			throw new Error('Missing mandatory configuration attributes for lorawan:dev_eui');
		}

		const mqttTopic = 'application/' + this.applicationId + '/device/' + devEUI.toLowerCase() + '/event/up';
		this.mqttClient.subscribeTopic(mqttTopic);
	}

	/**
	 * It stops observing a device. Abstract method
	 *
	 * @param      {string}  devId         The development identifier
	 * @param      {String}  devEUI         The development identifier
	 * @param      {<type>}  deviceObject  The device object
	 */
	stopObservingDevice(devId, devEUI, deviceObject) {
		const mqttTopic = 'application/' + this.applicationId + '/device/' + devEUI.toLowerCase() + '/event/up';
		this.mqttClient.unSubscribeTopic(mqttTopic);
	}

	/**
	 * It observes all devices
	 */
	observeAllDevices() {
		const mqttTopic = 'application/' + this.applicationId + '/device/+/event/up';
		this.mqttClient.subscribeTopic(mqttTopic);
	}

	/**
	 * It stops observing all devices.
	 */
	stopObserveAllDevices() {
		const mqttTopic = 'application/' + this.applicationId + '/device/+/event/up';
		this.mqttClient.unSubscribeTopic(mqttTopic);
	}
}

exports.ChirpStackService = ChirpStackService;
