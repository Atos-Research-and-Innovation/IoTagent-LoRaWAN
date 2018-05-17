# FIWARE IoT Agent for LoRaWAN protocol

[![License badge](https://img.shields.io/badge/license-AGPL-blue.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Documentation badge](https://readthedocs.org/projects/iot-agent-lorawan/badge/?version=latest)](http://iot-agent-lorawan.readthedocs.io/en/latest/?badge=latest)
[![Docker badge](https://img.shields.io/docker/pulls/ioeari/iotagent-lora.svg)](https://hub.docker.com/r/ioeari/iotagent-lora/)
[![Support badge](https://img.shields.io/badge/support-sof-yellowgreen.svg)](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/issues)
[![Build Status](https://img.shields.io/travis/Atos-Research-and-Innovation/IoTagent-LoRaWAN.svg?branch=master)](https://travis-ci.org/Atos-Research-and-Innovation/IoTagent-LoRaWAN/branches)

FIWARE *Internet of Things* Agent for LoRaWAN protocol enables data and commands to be exchanged between IoT devices and [FIWARE NGSI Context Brokers](https://forge.fiware.org/plugins/mediawiki/wiki/fiware/index.php/FIWARE.OpenSpecification.Data.ContextBroker) using [LoRaWAN](https://lora-alliance.org/about-lorawan) protocol.

It is based on the [FIWARE IoT Agent Node.js Library](https://github.com/telefonicaid/iotagent-node-lib). Further general information about FIWARE IoT Agents framework, its architecture and interaction model can be found in this repository.

This project is part of [FIWARE](https://www.fiware.org/). Check also the FIWARE Catalogue entry for the [IoTAgents](https://catalogue.fiware.org/enablers/backend-device-management-idas).

## Description

### Architecture

As it is explained in [What is LoRaWAN™](https://lora-alliance.org/sites/default/files/2018-04/what-is-lorawan.pdf), the proposed *Network Architecture* for a LoRaWAN based system relies on a mesh network architecture composed of *End nodes*, *Concentrators*, *Network Servers* and *Application Servers*. This IoTA is fully compliant with this architecture, providing interoperability between FIWARE NGSI Context Brokers and LoRaWAN devices.

![General](https://raw.githubusercontent.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/master/docs/img/iotagent_lorawan_arch.png )

### Supported stacks

- [The Things Network](https://www.thethingsnetwork.org/)
- [LoRaServer](https://www.loraserver.io/)

### Data models

- [CayenneLpp](https://www.thethingsnetwork.org/docs/devices/arduino/api/cayennelpp.html)
- [CBOR](https://tools.ietf.org/html/rfc7049)

## Installation

### Requirements
- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://docs.mongodb.com/manual/installation/)
- [FIWARE Orion Context Broker](https://github.com/telefonicaid/fiware-orion)

### Cloning the Github repository

1. Clone the repository with the following command:
```
https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN.git
```

2. Once the repository is cloned, you have to download the dependencies for the project, and let it ready to the execution. From the root folder of the project execute:
```
npm install
```

3. Launch the IoT Agent with the default configuration
```
node bin/iotagent-lora
```
You can use a custom configuration file:
```
node bin/iotagent-lora custom_config.js
```
The bootstrap process should finish with:
```
info: Loading devices from registry
info: LoRaWAN IoT Agent started
```

4. Check that the IoTA is running correctly:
 ```
curl -v http://localhost:4061/iot/about
```
The result must be similar to:
```
{"libVersion":"2.6.0-next","port":4061,"baseRoot":"/"}
```

### Using Docker

A ready to use Docker image is [provided](https://hub.docker.com/r/ioeari/iotagent-lora/)

```
docker run -p 4061:4061 ioeari/iotagent-lora
```

### Using Docker-compose

This project contains an example to deploy the IoTA and all the requirement using docker-compose.

```
docker-compose -f docker/docker-compose.yml up
```

## Users manual

Please check [Users manual](docs/users_manual.md)

## Development manual

Please check [Development manual](docs/development_manual.md)

## License

FIWARE IoT Agent for LoRaWAN protocol is licensed under Affero General Public License (GPL) version 3.
