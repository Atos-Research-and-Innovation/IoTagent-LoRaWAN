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

var winston = require('winston');

/**
 * Converts a Cayenne LPP payload to NGSI
 *
 * @param      {String}    payload  Cayenne LPP payload
 * @param      {Objects}  device   IOTA Device object
 */
function toNgsi (payload, device) {
    var ngsiAtts = [];
    var jsonPayload;
    winston.info('Decoding CaynneLPP message:' + payload);
    try {
        jsonPayload = JSON.parse(payload);
    } catch (e) {
        winston.error('Error decoding CaynneLPP message:' + e);
        return;
    }

    if (device.active && device.active.length > 0) {
        if (jsonPayload.payload_fields) {
            for (var field in jsonPayload.payload_fields) {
                for (var i = 0; i < device.active.length; i++) {
                    if (field === device.active[i].name) {
                        ngsiAtts.push(
                            {
                                'name': field,
                                'type': device.active[i].type,
                                'value': jsonPayload.payload_fields[field]
                            }
                        );
                    } else if (device.active[i].object_id && device.active[i].object_id === field) {
                        ngsiAtts.push(
                            {
                                'name': field,
                                'type': device.active[i].type,
                                'value': jsonPayload.payload_fields[field]
                            }
                        );
                    }
                }
            }
        }
    } else {
        winston.debug('Device provisioned without active attributes');
    }
    return ngsiAtts;
}

exports.toNgsi = toNgsi;
