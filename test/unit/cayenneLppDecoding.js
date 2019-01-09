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

var decoder = require('../../lib/dataModels/cayenneLpp');
var translator = require('../../lib/dataTranslationService');
require('chai').should();

describe('CayenneLpp decoding', function () {
    it('Should decode a payload with digital input, digital output, temperature, relative humidity and barometric pressure', function (done) {
        var cayenneLppMessageBase64 = 'AHMAAAFnARACaAADAGQEAQA=';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        decodedMessage.should.be.an('object');
        decodedMessage.should.have.property('temperature_1', 27.2);
        decodedMessage.should.have.property('barometric_pressure_0', 0);
        decodedMessage.should.have.property('digital_in_3', 100);
        decodedMessage.should.have.property('digital_out_4', 0);
        decodedMessage.should.have.property('relative_humidity_2', 0);
        return done();
    });

    it('Should decode a payload with temperature', function (done) {
        var cayenneLppMessageBase64 = 'AWf/1w==';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        decodedMessage.should.have.property('temperature_1', -4.1);
        return done();
    });

    it('Should decode a payload with analog input and analog output', function (done) {
        var cayenneLppMessageBase64 = 'DQL63gADEkU=';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        decodedMessage.should.have.property('analog_in_13', -13.14);
        decodedMessage.should.have.property('analog_out_0', 46.77);
        return done();
    });

    it('Should decode a payload with luminosity and presence', function (done) {
        var cayenneLppMessageBase64 = 'FWUAFwdmLA==';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        decodedMessage.should.have.property('luminosity_21', 23);
        decodedMessage.should.have.property('presence_7', 44);
        return done();
    });

    it('Should decode a payload with accelerometer', function (done) {
        var cayenneLppMessageBase64 = 'BnEE0vsuAAA==';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        decodedMessage.should.have.property('accelerometer_6');
        decodedMessage.accelerometer_6.should.have.property('x', 1.234);
        decodedMessage.accelerometer_6.should.have.property('y', -1.234);
        decodedMessage.accelerometer_6.should.have.property('z', 0);
        return done();
    });

    it('Should decode a payload with gyrometer', function (done) {
        var cayenneLppMessageBase64 = 'EoYBxx7THds=';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        decodedMessage.should.have.property('gyrometer_18');
        decodedMessage.gyrometer_18.should.have.property('x', 4.55);
        decodedMessage.gyrometer_18.should.have.property('y', 78.91);
        decodedMessage.gyrometer_18.should.have.property('z', 76.43);
        return done();
    });

    it('Should decode a payload with GPS', function (done) {
        var cayenneLppMessageBase64 = 'AYgGdl/ylgoAA+g=';
        var decodedMessage = decoder.decodeCayenneLpp(cayenneLppMessageBase64);
        decodedMessage.should.have.property('gps_1');
        decodedMessage.gps_1.should.have.property('latitude', 42.3519);
        decodedMessage.gps_1.should.have.property('longitude', -87.9094);
        decodedMessage.gps_1.should.have.property('altitude', 10);
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

    var deviceGps = {
        active: [
            {
                name: 'gps_1',
                type: 'geo:point'
            }
        ]

    };

    it('Should translate a CayenneLpp payload to NGSI', function (done) {
        var cayenneLppMessageBase64 = 'AHMAAAFnARACaAADAGQEAQA=';
        var decodedMessage = translator.toNgsi(cayenneLppMessageBase64, device);
        decodedMessage.should.be.an('array');
        return done();
    });

    it('Should translate a CayenneLpp payload including GPS to NGSI', function (done) {
        var cayenneLppMessageBase64 = 'AYgGdl/ylgoAA+g=';
        var decodedMessage = translator.toNgsi(cayenneLppMessageBase64, deviceGps);
        decodedMessage.should.be.an('array');
        decodedMessage.should.have.length(1);
        decodedMessage[0].should.be.an('object');
        decodedMessage[0].should.have.property('name', 'gps_1');
        decodedMessage[0].should.have.property('type', 'geo:point');
        decodedMessage[0].should.have.property('value', '42.3519,-87.9094');
        return done();
    });
});
