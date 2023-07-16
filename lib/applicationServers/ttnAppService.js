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

const config = require('../configService');
const appService = require('./abstractAppService');
const mqttClient = require('../bindings/mqttClient');
const iotAgentLib = require('iotagent-node-lib');
const regenerateTransid = iotAgentLib.regenerateTransid;
const intoTrans = iotAgentLib.intoTrans;
const context = {
	op: 'IoTAgentLoRaWAN.TtnAppService'
};
const _ = require('lodash');

/**
 *Class that represents a TTN LoRaWAN app server
 */
class TtnAppService extends appService.AbstractAppService {
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
			throw new Error('applicationId is mandatory for TTN');
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
		config.getLogger().info(context, 'New message in topic22222', mqttTopic);
		const splittedMqttTopic = mqttTopic.split('/');
		if (splittedMqttTopic.length !== 5) {
			const errorMessage = 'Bad format for a TTN topic';
			config.getLogger().error(context, errorMessage);
		} else {
			const deviceId = splittedMqttTopic[3];
			const device = this.getDevice(deviceId);
			try {
				message = JSON.parse(message);
			} catch (e) {
				config.getLogger().error(context, 'Error decoding message:' + e);
				message = null;
				return;
			}

			const localContext = _.clone(context);
			if (device) {
				localContext.srv = device.service;
				localContext.subsrv = device.subservice;
			}

			if (message) {
				let deviceEui;
				const dataModel = this.getDataModel(deviceId, null);
				if (message.hardware_serial) {
					deviceEui = message.hardware_serial;
				}

				if (dataModel === 'application_server' && message.payload_fields) {
					config.getLogger().info(context, 'debug: message.payload_fields');
					intoTrans(localContext, this.messageHandler)(this, deviceId, deviceEui, message.payload_fields);
				} else if (message.payload_raw) {
					config.getLogger().info(context, 'debug: message.payload_raw)');
					intoTrans(localContext, this.messageHandler)(this, deviceId, deviceEui, message.payload_raw);
				} else if (message.uplink_message && message.uplink_message.frm_payload) {
					config.getLogger().info(context, 'debug: message.uplink_message.frm_payload');
					intoTrans(localContext, this.messageHandler)(
						this, deviceId, 
						deviceEui, 
						message.uplink_message.frm_payload
					);
				} else if (message.uplink_message && message.uplink_message.decoded_payload) {
					config.getLogger().info(context, 'debug: message.uplink_message.decoded_payload');
					intoTrans(localContext, this.messageHandler)(
						this,
						deviceId,
						deviceEui,
						message.uplink_message.decoded_payload
					);
				} else {
					intoTrans(localContext, this.messageHandler)(this, deviceId, deviceEui, null);
				}
			} else {
				intoTrans(localContext, this.messageHandler)(this, deviceId, null, null);
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
	/* eslint-disable-next-line no-unused-vars */
	observeDevice(devId, devEUI, deviceObject) {
		const mqttTopic = 'v3/' + this.applicationId + '/devices/' + devId + '/up';
		this.mqttClient.subscribeTopic(mqttTopic);
	}

	/**
	 * It stops observing a device. Abstract method
	 *
	 * @param      {string}  devId         The development identifier
	 * @param      {String}  devEUI         The development identifier
	 * @param      {<type>}  deviceObject  The device object
	 */
	/* eslint-disable-next-line no-unused-vars */
	stopObservingDevice(devId, devEUI, deviceObject) {
		const mqttTopic = 'v3/' + this.applicationId + '/devices/' + devId + '/up';
		this.mqttClient.unSubscribeTopic(mqttTopic);
	}

	/**
	 * It observes all devices
	 */
	observeAllDevices() {
		const mqttTopic = 'v3/' + this.applicationId + '/devices/+/up';
		this.mqttClient.subscribeTopic(mqttTopic);
	}

	/**
	 * It stops observing all devices.
	 */
	stopObserveAllDevices() {
		const mqttTopic = 'v3/' + this.applicationId + '/devices/+/up';
		this.mqttClient.unSubscribeTopic(mqttTopic);
	}
}

exports.TtnAppService = TtnAppService;
