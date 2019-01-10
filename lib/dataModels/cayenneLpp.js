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

const CAYENNELPP_MAX_CHANNEL = 255;
const CAYENNELPP_MIN_SIZE_BYTES = 3;

const LPP_DIGITAL_INPUT = 0;
const LPP_DIGITAL_OUTPUT = 1;
const LPP_ANALOG_INPUT = 2;
const LPP_ANALOG_OUTPUT = 3;
const LPP_LUMINOSITY = 101;
const LPP_PRESENCE = 102;
const LPP_TEMPERATURE = 103;
const LPP_RELATIVE_HUMIDITY = 104;
const LPP_ACCELEROMETER = 113;
const LPP_BAROMETRIC_PRESSURE = 115;
const LPP_GYROMETER = 134;
const LPP_GPS = 136;

const LPP_DIGITAL_INPUT_NAME = 'digital_in';
const LPP_DIGITAL_OUTPUT_NAME = 'digital_out';
const LPP_ANALOG_INPUT_NAME = 'analog_in';
const LPP_ANALOG_OUTPUT_NAME = 'analog_out';
const LPP_LUMINOSITY_NAME = 'luminosity';
const LPP_PRESENCE_NAME = 'presence';
const LPP_TEMPERATURE_NAME = 'temperature';
const LPP_RELATIVE_HUMIDITY_NAME = 'relative_humidity';
const LPP_ACCELEROMETER_NAME = 'accelerometer';
const LPP_BAROMETRIC_PRESSURE_NAME = 'barometric_pressure';
const LPP_GYROMETER_NAME = 'gyrometer';
const LPP_GPS_NAME = 'gps';

const LPP_DIGITAL_INPUT_SIZE = 1; // 1 byte
const LPP_DIGITAL_OUTPUT_SIZE = 1; // 1 byte
const LPP_ANALOG_INPUT_SIZE = 2; // 2 bytes, 0.01 signed
const LPP_ANALOG_OUTPUT_SIZE = 2; // 2 bytes, 0.01 signed
const LPP_LUMINOSITY_SIZE = 2; // 2 bytes, 1 lux unsigned
const LPP_PRESENCE_SIZE = 1; // 1 byte, 1
const LPP_TEMPERATURE_SIZE = 2; // 2 bytes, 0.1°C signed
const LPP_RELATIVE_HUMIDITY_SIZE = 1; // 1 byte, 0.5% unsigned
const LPP_ACCELEROMETER_SIZE = 6; // 2 bytes per axis, 0.001G
const LPP_BAROMETRIC_PRESSURE_SIZE = 2; // 2 bytes 0.1 hPa Unsigned
const LPP_GYROMETER_SIZE = 6; // 2 bytes per axis, 0.01 °/s
const LPP_GPS_SIZE = 9; // 3 byte lon/lat 0.0001 °, 3 bytes alt 0.01 meter

/**
 * Decodes a Cayenne LPP payload
 *
 * @param      {String}    payload  Cayenne LPP payload
 */
function decodePayload (payload) {
    var decodedObject = {};
    winston.info('Decoding CaynneLPP message:' + payload);
    try {
        decodedObject = decodeCayenneLpp(payload);
    } catch (e) {
        winston.error('Error decoding CaynneLPP message:' + e);
        return;
    }
    return decodedObject;
}

function decodeCayenneLpp (bufferBase64) {
    var result = {};
    var buffer = Buffer.from(bufferBase64, 'base64');
    if (buffer && validateCayenneLppSize(buffer)) {
        var cursor = 0;
        var value;
        var propertyName;
        while (cursor < buffer.length) {
            var channel = buffer.readUInt8(cursor);
            if (validateCayenneLppChannel(channel)) {
                cursor++;
                var type = buffer[cursor];
                cursor++;

                switch (type) {
                case LPP_DIGITAL_INPUT:

                    if (cursor + LPP_DIGITAL_INPUT_SIZE > buffer.length) {
                        throw new Error('Invalid CayennLpp message');
                    } else {
                        value = buffer[cursor];
                        cursor++;
                        propertyName = LPP_DIGITAL_INPUT_NAME + '_' + channel.toString();
                        result[propertyName] = value;
                    }
                    break;
                case LPP_DIGITAL_OUTPUT:
                    if (cursor + LPP_DIGITAL_OUTPUT_SIZE > buffer.length) {
                        throw new Error('Invalid CayennLpp message');
                    } else {
                        value = buffer[cursor];
                        cursor++;
                        propertyName = LPP_DIGITAL_OUTPUT_NAME + '_' + channel.toString();
                        result[propertyName] = value;
                    }
                    break;
                case LPP_ANALOG_INPUT:
                    if (cursor + LPP_ANALOG_INPUT_SIZE > buffer.length) {
                        throw new Error('Invalid CayennLpp message');
                    } else {
                        value = buffer.readInt16BE(cursor) / 100.0;
                        cursor += 2;
                        propertyName = LPP_ANALOG_INPUT_NAME + '_' + channel.toString();
                        result[propertyName] = value;
                    }
                    break;
                case LPP_ANALOG_OUTPUT:
                    if (cursor + LPP_ANALOG_OUTPUT_SIZE > buffer.length) {
                        throw new Error('Invalid CayennLpp message');
                    } else {
                        value = buffer.readInt16BE(cursor) / 100.0;
                        cursor += 2;
                        propertyName = LPP_ANALOG_OUTPUT_NAME + '_' + channel.toString();
                        result[propertyName] = value;
                    }
                    break;
                case LPP_LUMINOSITY:
                    if (cursor + LPP_LUMINOSITY_SIZE > buffer.length) {
                        throw new Error('Invalid CayennLpp message');
                    } else {
                        value = buffer.readInt16BE(cursor);
                        cursor += 2;
                        propertyName = LPP_LUMINOSITY_NAME + '_' + channel.toString();
                        result[propertyName] = value;
                    }
                    break;
                case LPP_PRESENCE:
                    if (cursor + LPP_PRESENCE_SIZE > buffer.length) {
                        throw new Error('Invalid CayennLpp message');
                    } else {
                        value = buffer[cursor];
                        cursor++;
                        propertyName = LPP_PRESENCE_NAME + '_' + channel.toString();
                        result[propertyName] = value;
                    }
                    break;
                case LPP_TEMPERATURE:
                    if (cursor + LPP_TEMPERATURE_SIZE > buffer.length) {
                        throw new Error('Invalid CayennLpp message');
                    } else {
                        value = buffer.readInt16BE(cursor) / 10.0;
                        cursor += 2;
                        propertyName = LPP_TEMPERATURE_NAME + '_' + channel.toString();
                        result[propertyName] = value;
                    }
                    break;
                case LPP_RELATIVE_HUMIDITY:
                    if (cursor + LPP_RELATIVE_HUMIDITY_SIZE > buffer.length) {
                        throw new Error('Invalid CayennLpp message');
                    } else {
                        value = buffer[cursor] / 2.0;
                        cursor++;
                        propertyName = LPP_RELATIVE_HUMIDITY_NAME + '_' + channel.toString();
                        result[propertyName] = value;
                    }
                    break;
                case LPP_ACCELEROMETER:
                    if (cursor + LPP_ACCELEROMETER_SIZE > buffer.length) {
                        throw new Error('Invalid CayennLpp message');
                    } else {
                        var varAccX = buffer.readInt16BE(cursor) / 1000.0;
                        cursor += 2;
                        var varAccY = buffer.readInt16BE(cursor) / 1000.0;
                        cursor += 2;
                        var varAccZ = buffer.readInt16BE(cursor) / 1000.0;
                        cursor += 2;
                        value = { x: varAccX, y: varAccY, z: varAccZ };
                        propertyName = LPP_ACCELEROMETER_NAME + '_' + channel.toString();
                        result[propertyName] = value;
                    }
                    break;
                case LPP_BAROMETRIC_PRESSURE:
                    if (cursor + LPP_BAROMETRIC_PRESSURE_SIZE > buffer.length) {
                        throw new Error('Invalid CayennLpp message');
                    } else {
                        value = buffer.readInt16BE(cursor) / 10.0;
                        cursor += 2;
                        propertyName = LPP_BAROMETRIC_PRESSURE_NAME + '_' + channel.toString();
                        result[propertyName] = value;
                    }
                    break;
                case LPP_GYROMETER:
                    if (cursor + LPP_GYROMETER_SIZE > buffer.length) {
                        throw new Error('Invalid CayennLpp message');
                    } else {
                        var varX = buffer.readInt16BE(cursor) / 100.0;
                        cursor += 2;
                        var varY = buffer.readInt16BE(cursor) / 100.0;
                        cursor += 2;
                        var varZ = buffer.readInt16BE(cursor) / 100.0;
                        cursor += 2;
                        value = { x: varX, y: varY, z: varZ };
                        propertyName = LPP_GYROMETER_NAME + '_' + channel.toString();
                        result[propertyName] = value;
                    }
                    break;
                case LPP_GPS:
                    if (cursor + LPP_GPS_SIZE > buffer.length) {
                        throw new Error('Invalid CayennLpp message');
                    } else {
                        var latitude = readInt24BE(buffer, cursor) / 10000.0;
                        cursor += 3;
                        var longitude = readInt24BE(buffer, cursor) / 10000.0;
                        cursor += 3;
                        var altitude = readInt24BE(buffer, cursor) / 100.0;
                        cursor += 3;
                        value = { latitude: latitude, longitude: longitude, altitude: altitude };
                        propertyName = LPP_GPS_NAME + '_' + channel.toString();
                        result[propertyName] = value;
                    }
                    break;
                }
            } else {
                throw new Error('Invalid CayennLpp channel');
            }
        }
    } else {
        throw new Error('Invalid CayennLpp buffer size');
    }

    return result;
}

/**
 * It validates the size of a CayenneLpp message
 *
 * @param      {<type>}   buffer  The buffer
 * @return     {boolean}  { description_of_the_return_value }
 */
function validateCayenneLppSize (buffer) {
    var result = false;
    if (buffer && buffer.length >= CAYENNELPP_MIN_SIZE_BYTES) {
        result = true;
    }

    return result;
}

/**
 * It validates the a CayenneLpp channel
 *
 * @param      {<type>}   buffer  The buffer
 * @return     {boolean}  { description_of_the_return_value }
 */
function validateCayenneLppChannel (channel) {
    var result = true;

    if (channel > CAYENNELPP_MAX_CHANNEL) {
        result = false;
    }

    return result;
}

/**
 * It reads an integer represented using 24 bits
 *
 * @param      {<type>}  buf     The buffer
 * @param      {number}  offset  The offset
 * @return     {<type>}  { description_of_the_return_value }
 */
function readInt24BE (buf, offset) {
    return buf.readIntBE(offset, 3);
}

exports.decodePayload = decodePayload;
exports.decodeCayenneLpp = decodeCayenneLpp;
