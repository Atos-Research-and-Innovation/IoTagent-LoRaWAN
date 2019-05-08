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

var mqtt = require('mqtt');
var winston = require('winston');

/**
 *MQTT client
 */
class MqttClient {
    /**
     * Constructs the object.
     *
     * @param      {<type>}  host      The host
     * @param      {<type>}  username  The username
     * @param      {<type>}  password  The password
     * @param      {<type>}  listener  The listener
     */
    constructor(host, username, password, listener) {
        if (!host || !listener) {
            throw new Error('Invalid arguments');
        }

        this.host = host;
        this.username = username;
        this.password = password;
        this.topics = {};
        this.listener = listener;
    }

    /**
     * It starts the MQTT client
     *
     * @param      {Function}  callback  The callback
     */
    start(callback) {
        var host = 'mqtt://' + this.host;
        var options = {};
        options.username = this.username;
        options.password = this.password;
        var connected = false;

        winston.info('Connecting to MQTT server %s with options:%s', host, JSON.stringify(options));
        this.mqttClient = mqtt.connect(
            host,
            options
        );
        this.mqttClient.on('error', function(error) {
            winston.error('Error connecting to MQTT server:' + JSON.stringify(error));
        });
        this.mqttClient.on('message', this.listener);
        this.mqttClient.on('connect', function(object, binding) {
            winston.info('Connected to MQTT server');
            if (!connected) {
                connected = true;
                return callback();
            }
        });
    }

    /**
     * It stops the MQTT client
     *
     * @param      {Function}  callback  The callback
     */
    stop(callback) {
        this.mqttClient.end(function() {
            if (callback) {
                return callback();
            }
        });
    }

    /**
     * It subscribes to a specific topic
     *
     * @param      {<type>}  topic   The topic
     */
    subscribeTopic(topic) {
        winston.info('Subscribing to MQTT topic:%s', topic);
        this.mqttClient.subscribe(topic);
    }

    /**
     * It unsubscribes from a specific topic
     *
     * @param      {<type>}  topic   The topic
     */
    unSubscribeTopic(topic) {
        winston.info('Unsubscribing from MQTT topic:%s', topic);
        this.mqttClient.unsubscribe(topic);
    }
}

exports.MqttClient = MqttClient;
