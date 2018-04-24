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

var cayenneLpp = require('./dataModels/cayenneLpp');
var cbor = require('./dataModels/cbor');

/**
 * It converts a message received from a LoRaWAN application server to NGSI
 *
 * @param      {Object}  payload  The payload
 * @param      {Object}  device   The device
 * @return     {Object}  {NGSI message}
 */
function toNgsi (payload, device) {
    var ngsiMessage = {};
    if (payload && device) {
        if (device.internalAttributes) {
            var lorawanConf = {};
            if (device.internalAttributes instanceof Array) {
                for (var i = 0; i < device.internalAttributes.length; i++) {
                    console.log(JSON.stringify(device.internalAttributes[i]));
                    if (device.internalAttributes[i].lorawan) {
                        lorawanConf = device.internalAttributes[i];
                        break;
                    }
                }
            } else if (device.internalAttributes.lorawan) {
                lorawanConf = device.internalAttributes.lorawan;
            }

            if (lorawanConf) {
                if (lorawanConf.data_model === 'cbor') {
                    ngsiMessage = cbor.toNgsi(payload, device);
                } else {
                    ngsiMessage = cayenneLpp.toNgsi(payload, device);
                }
            }
        } else {
            ngsiMessage = cayenneLpp.toNgsi(payload, device);
        }
    }

    return ngsiMessage;
};

exports.toNgsi = toNgsi;
