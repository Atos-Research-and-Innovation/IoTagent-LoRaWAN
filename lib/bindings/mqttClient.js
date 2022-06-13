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

const mqtt = require('mqtt');
const config = require('../configService');
const context = {
	op: 'IoTAgentLoRaWAN.MqttClient'
};
const sleep = (waitTimeInMs) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

/**
 *MQTT client
 */
class MqttClient {
	/**
	 * Constructs the object.
	 *
	 * @param      {<type>}  host      The host
	 * @param      {<type>}  port      The port
	 * @param      {<type>}  protocol  The protocol
	 * @param      {<type>}  username  The username
	 * @param      {<type>}  password  The password
	 * @param      {<type>}  listener  The listener
	 */
	constructor(host, port, protocol, username, password, options, listener, id) {
		if (!host || !listener) {
			throw new Error('Invalid arguments');
		}

		this.host = host;
		this.port = 1883;
		if (port) {
			this.port = port;
		}
		this.protocol = 'mqtt';
		if (protocol) {
			this.protocol = protocol;
		}
		this.options = {};
		if (options && typeof options === 'object') {
			this.options = options;
		}

		this.options.username = username;
		this.options.password = password;
		this.topics = [];
		this.listener = listener;
		this.id = id + '_' + Math.random().toString(16).substr(2, 8);
		this.options.clientId = this.id;
	}

	/**
	 * It starts the MQTT client
	 *
	 * @param      {Function}  callback  The callback
	 */
	start(callback) {
		const host = this.protocol + '://' + this.host + ':' + this.port;

		const retries = 5;
		let retryTime = 5;
		let numRetried = 0;

		let connected = false;
		config
			.getLogger()
			.info(context, 'Connecting to MQTT server %s with options:%s', host, JSON.stringify(this.options));
		this.mqttClient = mqtt.connect(host, this.options);
		this.mqttClient.on('error', function (error) {
			config.getLogger().error('Error connecting to MQTT server:' + JSON.stringify(error));
		});
		this.mqttClient.on('message', this.listener);
		// eslint-disable-next-line no-unused-vars
		this.mqttClient.on('connect', function (object, binding) {
			config.getLogger().info(context, 'Connected to MQTT server');
			if (!connected) {
				connected = true;
				if (callback) {
					return callback();
				}
			}
		});
		this.mqttClient.on('end', function () {
			config.getLogger().warn(context, 'MQTT Client end: %s', this.options.clientId);
		});

		this.mqttClient.on('reconnect', async function () {
			config.getLogger().warn(context, 'MQTT Client reconnect: %s', this.options.clientId);
			if (numRetried <= retries) {
				retryTime = retryTime + 10 * numRetried;
				numRetried++;
				config.getLogger().debug(context, 'elapsed %s', retryTime);
				await sleep(retryTime * 1000);
			} else {
				config
					.getLogger()
					.error(context, 'Too many MQTT reconnect attempts, ending client: %s', this.options.clientId);
				this.end(function () {
					if (callback) {
						return callback();
					}
				});
			}
		});
	}

	/**
	 * It stops the MQTT client
	 *
	 * @param      {Function}  callback  The callback
	 */
	stop(callback) {
		config.getLogger().info(context, 'Stopping MQTT Connection for client: %s', this.id);
		this.mqttClient.end(function () {
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
		config.getLogger().debug(context, 'Subscribing to MQTT topic: %s', topic);
		let found = false;
		for (const t in this.topics) {
			if (this.topics[t] === topic) {
				config.getLogger().debug(context, 'Topic %s exists', topic);
				found = true;
			}
		}
		if (!found) {
			this.topics.push(topic);
			if (this.mqttClient.connected) {
				this.mqttClient.subscribe(topic, null, function (error) {
					if (error) {
						config.getLogger().error(context, 'Failed to subscribe to the following topic: %j', topic);
					} else {
						config.getLogger().info(context, 'Successfully subscribed to the following topic: %j', topic);
					}
				});
			}
		}
	}

	/**
	 * It unsubscribes from a specific topic
	 *
	 * @param      {<type>}  topic   The topic
	 */
	unSubscribeTopic(topic) {
		config.getLogger().info(context, 'Unsubscribing from MQTT topic: %s', topic);
		// eslint-disable-next-line no-unused-vars
		const filtered = this.topics.filter(function (value, index, arr) {
			return value === topic;
		});
		this.topics = filtered;
		this.mqttClient.unsubscribe(topic);
	}
}

exports.MqttClient = MqttClient;
