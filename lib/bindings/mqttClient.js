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
var async = require('async');

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
    constructor(host, username, password, listener, id) {
        if (!host || !listener) {
            throw new Error('Invalid arguments');
        }

        this.host = host;
        this.username = username;
        this.password = password;
        this.topics = [];
        this.listener = listener;
        this.mqttClient = null;
        this.mqttConn = null;
        this.id =
            id +
            '_' +
            Math.random()
                .toString(16)
                .substr(2, 8);
    }

    getId() {
        return this.id;
    }

    setMqttClient(mqttClient) {
        this.mqttClient = mqttClient;
    }

    getMqttClient() {
        return this.mqttClient;
    }

    setMqttConn(mqttConn) {
        this.mqttConn = mqttConn;
    }

    getMqttConn() {
        return this.mqttConn;
    }

    setTopics(topics) {
        this.topics = topics;
    }

    getTopics() {
        return this.topics;
    }

    setListener(listener) {
        this.listener = listener;
    }

    getListener() {
        return this.listener;
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
        options.keepalive = 60;
        options.connectTimeout = 30 * 1000;
        options.clean = true;
        options.clientId = this.id;
        var retries = 5;
        var retryTime = 5;
        var isConnecting = false;
        var numRetried = 0;

        winston.info('Starting MQTT binding for client: %s', this.id);

        function createConnection(client, callback) {
            winston.info('Connecting to MQTT server %s with options: %s', host, JSON.stringify(options));
            if (isConnecting) {
                return;
            }
            isConnecting = true;
            var mqttClient = mqtt.connect(
                host,
                options
            );

            client.setMqttClient(mqttClient);

            isConnecting = false;
            // TDB: check if error
            if (!mqttClient) {
                winston.error('error mqttClient not created');
                if (numRetried <= retries) {
                    numRetried++;
                    return setTimeout(createConnection, retryTime * 1000, callback);
                }
            }

            mqttClient.on('error', function(e) {
                /*jshint quotmark: double */
                winston.error('Error connecting to MQTT server %s:' + JSON.stringify(e), client.getId());
                /*jshint quotmark: single */
                // return callback(e);
            });
            mqttClient.on('message', client.getListener());
            mqttClient.on('connect', function(ack) {
                winston.info('MQTT Client connected: %s', client.getId());
                client.setMqttConn(mqttClient);
                client.recreateSubscriptions();
            });
            mqttClient.on('disconnect', function(ack) {
                winston.info('MQTT Client disconnected: %s', client.getId());
            });
            mqttClient.on('end', function(ack) {
                winston.info('MQTT Client ended: %s', client.getId());
            });
            mqttClient.on('reconnect', function(ack) {
                winston.info('MQTT Client reconnect: %s', client.getId());
                client.recreateSubscriptions();
            });
            mqttClient.on('offline', function(ack) {
                winston.info('MQTT Client offline: %s', client.getId());
            });
            mqttClient.on('close', function() {
                // If mqttConn is null, the connection has been closed on purpose
                if (client.getMqttConn()) {
                    if (numRetried <= retries) {
                        winston.warn('reconnecting... : %s', client.getId());
                        numRetried++;
                        return setTimeout(createConnection, retryTime * 1000);
                    }
                } else {
                    return;
                }
            });

            if (callback) {
                return callback();
            }
        } // function createConnection

        async.waterfall([async.apply(createConnection, this)], function(error) {
            if (error) {
                winston.debug('MQTT error %j', error);
            }
            return callback();
        });
    }

    /**
     * It stops the MQTT client
     *
     * @param      {Function}  callback  The callback
     */
    stop(callback) {
        winston.info('Stopping MQTT Binding for client: %s', this.id);

        async.series([unsubscribeAll, this.mqttClient.end.bind(this.mqttClient, true)], function() {
            config.getLogger().info('MQTT Binding Stopped for client: %s', this.id);
            if (this.mqttConn) {
                this.mqttConn = null;
            }
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
        winston.info('Subscribing to MQTT topic: %s', topic);
        var found = false;
        for (var t in this.topics) {
            if (this.topics[t] === topic) {
                winston.info('Topic %s exists', topic);
                found = true;
            }
        }
        if (!found) {
            this.topics.push(topic);
            if (this.mqttClient.connected)
                this.mqttClient.subscribe(topic, null, function(error) {
                    if (error) {
                        winston.error('Failed to subscribe to the following topic: %j', topic);
                    } else {
                        winston.info('Successfully subscribed to the following topic: %j', topic);
                    }
                });
        }
    }

    /**
     * It unsubscribes from a specific topic
     *
     * @param      {<type>}  topic   The topic
     */
    unSubscribeTopic(topic) {
        winston.info('Unsubscribing from MQTT topic: %s', topic);
        var found = false;
        var filtered = this.topics.filter(function(value, index, arr) {
            return value === topic;
        });
        this.topics = filtered;
        this.mqttClient.unsubscribe(topic);
    }

    /**
     * Recreate the MQTT subscriptions.
     */
    recreateSubscriptions(callback) {
        winston.info('Recreating subscriptions');

        function subscribeToTopics(client, callback) {
            var topics = client.getTopics();
            winston.info('Subscribing to topics: %j', topics);

            client.getMqttClient().subscribe(topics, null, function(error) {
                if (error) {
                    winston.error('Failed to subscribe to the following topic: %j', topics);
                    callback(error);
                } else {
                    winston.info('Successfully subscribed to the following topic: %j', topics);
                }
            });
            if (callback) {
                return callback(null);
            }
        }

        async.waterfall([async.apply(subscribeToTopics, this)], function(error) {
            if (error) {
                winston.debug('MQTT error %j', error);
            }
            if (callback) {
                return callback(null);
            }
        });
    }

    /**
     * Unsubscribe the MQTT Client for all the topics of all the devices of all the services.
     */
    unsubscribeAll(client, callback) {
        function unsubscribeFromTopics(client, callback) {
            client.getMqttClient().unsubscribe(this.topics, null);

            if (callback) {
                return callback(null);
            }
        }

        async.waterfall([async.apply(unsubscribeFromTopics, this)], function(error) {
            if (error) {
                winston.debug('MQTT error %j', error);
            }
            if (callback) {
                return callback(null);
            }
        });
    }
}

exports.MqttClient = MqttClient;
