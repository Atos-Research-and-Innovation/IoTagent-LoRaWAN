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

var winston = require('winston');
var appService = require('./abstractAppService');
var mqttClient = require('../bindings/mqttClient');

/**
 *Class that represents a LoRaServer.io LoRaWAN app server
 */
class LoraserverIoService extends appService.AbstractAppService {
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
            this.applicationServer.username,
            this.applicationServer.password,
            this.preProcessMessage
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
        winston.info('New message in topic', mqttTopic);
        winston.debug('Message', JSON.stringify(message));

        var splittedMqttTopic = mqttTopic.split('/');
        if (splittedMqttTopic.length !== 5) {
            var errorMessage = 'Bad format for a LoRaServer.io topic';
            winston.error(errorMessage);
        } else {
            // var appId = splittedMqttTopic[0];
            var devEui = splittedMqttTopic[3];
            var device = this.getDeviceByEui(devEui);
            try {
                message = JSON.parse(message);
            } catch (e) {
                winston.error('Error decoding message:' + e);
                message = null;
                return;
            }

            var dataModel = this.getDataModel(null, message['devEUI']);

            var deviceId;
            if (device) {
                deviceId = device.id;
            } else if (message && message['deviceName']) {
                deviceId = message['deviceName'];
            }

            if (message) {
                if (dataModel === 'application_server' && message.object) {
                    this.messageHandler(this, deviceId, message['devEUI'], message['object']);
                } else if (dataModel !== 'application_server' && message.data) {
                    this.messageHandler(this, deviceId, message['devEUI'], message['data']);
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

        var mqttTopic = 'application/' + this.applicationId + '/device/' + devEUI.toLowerCase() + '/rx';
        this.mqttClient.subscribeTopic(mqttTopic);
        winston.info('Mqtt topic subscribed:%s', mqttTopic);
    }

    /**
     * It stops observing a device. Abstract method
     *
     * @param      {string}  devId         The development identifier
     * @param      {String}  devEUI         The development identifier
     * @param      {<type>}  deviceObject  The device object
     */
    stopObservingDevice(devId, devEUI, deviceObject) {
        var mqttTopic = 'application/' + this.applicationId + '/device/' + devEUI.toLowerCase() + '/rx';
        this.mqttClient.unSubscribeTopic(mqttTopic);
        winston.info('Mqtt topic unsubscribed:%s', mqttTopic);
    }

    /**
     * It observes all devices
     */
    observeAllDevices() {
        var mqttTopic = 'application/' + this.applicationId + '/device/+/rx';
        this.mqttClient.subscribeTopic(mqttTopic);
        winston.info('Mqtt topic subscribed:%s', mqttTopic);
    }

    /**
     * It stops observing all devices.
     */
    stopObserveAllDevices() {
        var mqttTopic = 'application/' + this.applicationId + '/device/+/rx';
        this.mqttClient.unSubscribeTopic(mqttTopic);
        winston.info('Mqtt topic unsubscribed:%s', mqttTopic);
    }
}

exports.LoraserverIoService = LoraserverIoService;
