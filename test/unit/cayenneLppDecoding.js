/*
 * Copyright 2018 Atos Spain S.A
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

var decoder = require('../../lib/dataModels/cayenneLpp');
var test = require('unit.js');

describe('CayenneLpp decoding', function () {
    it('Should decode a payload with digital input, digital output, temperature, relative humidity and barometric pressure', function (done) {
        var cayenneLppMessageBase64 = 'AHMAAAFnARACaAADAGQEAQA=';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        test.object(decodedMessage).hasProperty('temperature_1', 27.2);
        test.object(decodedMessage).hasProperty('barometric_pressure_0', 0);
        test.object(decodedMessage).hasProperty('digital_in_3', 100);
        test.object(decodedMessage).hasProperty('digital_out_4', 0);
        test.object(decodedMessage).hasProperty('relative_humidity_2', 0);
        return done();
    });

    it('Should decode a payload with temperature', function (done) {
        var cayenneLppMessageBase64 = 'AWf/1w==';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        test.object(decodedMessage).hasProperty('temperature_1', -4.1);
        return done();
    });

    it('Should decode a payload with analog input and analog output', function (done) {
        var cayenneLppMessageBase64 = 'DQL63gADEkU=';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        test.object(decodedMessage).hasProperty('analog_in_13', -13.14);
        test.object(decodedMessage).hasProperty('analog_out_0', 46.77);
        return done();
    });

    it('Should decode a payload with luminosity and presence', function (done) {
        var cayenneLppMessageBase64 = 'FWUAFwdmLA==';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        test.object(decodedMessage).hasProperty('luminosity_21', 23);
        test.object(decodedMessage).hasProperty('presence_7', 44);
        return done();
    });

    it('Should decode a payload with accelerometer', function (done) {
        var cayenneLppMessageBase64 = 'BnEE0vsuAAA==';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        test.object(decodedMessage).hasProperty('accelerometer_6');
        test.object(decodedMessage['accelerometer_6']).hasProperty('x', 1.234);
        test.object(decodedMessage['accelerometer_6']).hasProperty('y', -1.234);
        test.object(decodedMessage['accelerometer_6']).hasProperty('z', 0);
        return done();
    });

    it('Should decode a payload with gyrometer', function (done) {
        var cayenneLppMessageBase64 = 'EoYBxx7THds=';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        test.object(decodedMessage).hasProperty('gyrometer_18');
        test.object(decodedMessage['gyrometer_18']).hasProperty('x', 4.55);
        test.object(decodedMessage['gyrometer_18']).hasProperty('y', 78.91);
        test.object(decodedMessage['gyrometer_18']).hasProperty('z', 76.43);
        return done();
    });

    it('Should decode a payload with GPS', function (done) {
        var cayenneLppMessageBase64 = 'AYgGdl/ylgoAA+g=';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        test.object(decodedMessage).hasProperty('gps_1');
        test.object(decodedMessage['gps_1']).hasProperty('latitude', 42.3519);
        test.object(decodedMessage['gps_1']).hasProperty('longitude', -87.9094);
        test.object(decodedMessage['gps_1']).hasProperty('altitude', 10);
        return done();
    });
});

describe('NGSI translation', function (done) {
    var device = {
        active: [
            {
                name: 'temperature_1',
                type: 'number'
            }
        ]

    };

    it('Should translate a CayenneLpp payload to NGSI', function (done) {
        var cayenneLppMessageBase64 = 'AHMAAAFnARACaAADAGQEAQA=';
        var decodedMessage = decoder.toNgsi(cayenneLppMessageBase64, device);
        test.array(decodedMessage);
        return done();
    });
});
