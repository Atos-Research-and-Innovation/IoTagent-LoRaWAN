# FIWARE IoT Agent for LoRaWAN protocol

[![FIWARE IoT Agents](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/iot-agents.svg)](https://www.fiware.org/developers/catalogue/)
[![](https://img.shields.io/badge/tag-fiware+iot-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware+iot)

Copyright 2019 Atos Spain S.A

FIWARE _Internet of Things_ Agent for LoRaWAN protocol enables data and commands to be exchanged between IoT devices and
[FIWARE NGSI Context Brokers](https://forge.fiware.org/plugins/mediawiki/wiki/fiware/index.php/FIWARE.OpenSpecification.Data.ContextBroker)
using [LoRaWAN](https://lora-alliance.org/about-lorawan) protocol.

It is based on the [FIWARE IoT Agent Node.js Library](https://github.com/telefonicaid/iotagent-node-lib). Further
general information about FIWARE IoT Agents framework, its architecture and interaction model can be found in this
repository.

This project is part of [FIWARE](https://www.fiware.org/). Check also the FIWARE Catalogue entry for the
[IoT Agents](https://github.com/Fiware/catalogue/tree/master/iot-agents).

## Description

### Architecture

As it is explained in [What is LoRaWAN™](https://lora-alliance.org/sites/default/files/2018-04/what-is-lorawan.pdf), the
proposed _Network Architecture_ for a LoRaWAN based system relies on a mesh network architecture composed of _End
nodes_, _Concentrators_, _Network Servers_ and _Application Servers_. This IoTA is fully compliant with this
architecture, providing interoperability between FIWARE NGSI Context Brokers and LoRaWAN devices.

![General](https://raw.githubusercontent.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/master/docs/img/iotagent_lorawan_arch.png)

### Supported stacks

-   [The Things Network](https://www.thethingsnetwork.org/)
-   [LoRaServer](https://www.loraserver.io/)

### Data models

-   [CayenneLpp](https://www.thethingsnetwork.org/docs/devices/arduino/api/cayennelpp.html)
-   [CBOR](https://tools.ietf.org/html/rfc7049)

## Installation

### Requirements

-   [Node.js](https://nodejs.org/en/)
-   [MongoDB](https://docs.mongodb.com/manual/installation/)
-   [FIWARE Orion Context Broker](https://github.com/telefonicaid/fiware-orion)

### Cloning the GitHub repository

-   Clone the repository with the following command:

```bash
git clone https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN.git
```

-   Once the repository is cloned, you have to download the dependencies for the project, and let it ready to the
    execution. From the root folder of the project execute:

```bash
npm install
```

-   Launch the IoT Agent with the default configuration

```bash
node bin/iotagent-lora
```

You can use a custom configuration file:

```bash
node bin/iotagent-lora custom_config.js
```

The bootstrap process should finish with:

```text
info: Loading devices from registry
info: LoRaWAN IoT Agent started
```

-   Check that the IoTA is running correctly:

```bash
curl -v http://localhost:4061/iot/about
```

The result must be similar to:

```json
{ "libVersion": "2.6.0-next", "port": 4061, "baseRoot": "/" }
```

### Using Docker

A ready to use Docker image is [provided](https://hub.docker.com/r/ioeari/iotagent-lora/)

```bash
docker run -p 4061:4061 ioeari/iotagent-lora
```

### Using Docker-compose

This project contains an example to deploy the IoTA and all the requirement using docker-compose.

```bash
docker-compose -f docker/docker-compose.yml up
```

## Users manual

Please check [Users manual](users_manual.md)

## Development manual

Please check [Development manual](development_manual.md)

## License

FIWARE IoT Agent for LoRaWAN protocol is licensed under Affero General Public License (GPL) version 3.

Copyright 2019 Atos Spain S.A
