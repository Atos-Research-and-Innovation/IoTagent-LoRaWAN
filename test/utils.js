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

/* eslint-disable no-unused-vars */

const fs = require('fs');
const request = require('request');
const winston = require('winston');

function readExampleFile(name, raw) {
    let text = null;
    try {
        text = fs.readFileSync(name, 'UTF8');
    } catch (e) {
        /* eslint-disable no-console */
        console.error(JSON.stringify(e));
    }
    return raw ? text : JSON.parse(text);
}

function deleteEntityCB(cbConfig, service, servicePath, cbEntityName, callback) {
    const optionsCB = {
        url: 'http://' + cbConfig.host + ':' + cbConfig.port + '/v2/entities/' + cbEntityName,
        method: 'DELETE',
        json: true,
        headers: {
            'fiware-service': service,
            'fiware-servicepath': servicePath
        }
    };

    request(optionsCB, function(error, response, body) {
        if (error) {
            winston.error(error);
        }
        return callback();
    });
}

exports.readExampleFile = readExampleFile;
exports.deleteEntityCB = deleteEntityCB;
