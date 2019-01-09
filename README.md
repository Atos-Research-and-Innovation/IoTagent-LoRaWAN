# FIWARE IoT Agent for the LoRaWaN Protocol

[![FIWARE IoT Agents](https://nexus.lab.fiware.org/static/badges/chapters/iot-agents.svg)](https://www.fiware.org/developers/catalogue/)
[![License: APGL](https://img.shields.io/github/license/Atos-Research-and-Innovation/IoTagent-LoRaWAN.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Docker](https://img.shields.io/docker/pulls/fiware/iotagent-lorawan.svg)](https://hub.docker.com/r/fiware/iotagent-lorawan/)
[![](https://img.shields.io/badge/tag-fiware+iot-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware+iot)
<br>
[![Documentation badge](https://img.shields.io/readthedocs/fiware-lorawan.svg)](http://fiware-lorawan.readthedocs.io/en/latest/?badge=latest)
[![Build Status](https://img.shields.io/travis/Atos-Research-and-Innovation/IoTagent-LoRaWAN.svg?branch=master)](https://travis-ci.org/Atos-Research-and-Innovation/IoTagent-LoRaWAN/branches)
![Status](https://nexus.lab.fiware.org/static/badges/statuses/iot-lorawan.svg)

The Internet of Things Agent for LoRaWAN protocol enables data and commands to
be exchanged between IoT devices and the
[NGSI](https://swagger.lab.fiware.org/?url=https://raw.githubusercontent.com/Fiware/specifications/master/OpenAPI/ngsiv2/ngsiv2-openapi.json)
interface of a context broker using the
[LoRaWAN](https://lora-alliance.org/about-lorawan) protocol.

It is based on the
[IoT Agent Node.js Library](https://github.com/telefonicaid/iotagent-node-lib).
Further general information about the FIWARE IoT Agents framework, its
architecture and the common interaction model can be found in the library's
GitHub repository.

This project is part of [FIWARE](https://www.fiware.org/). For more information
check the FIWARE Catalogue entry for the
[IoT Agents](https://github.com/Fiware/catalogue/tree/master/iot-agents).

## Contents

-   [Background](#background)
-   [Install](#install)
-   [Usage](#usage)
-   [API](#api)
-   [Quality Assurance](#quality-assurance)
-   [License](#license)

## Background

### Architecture

As explained in
[What is LoRaWAN™](https://lora-alliance.org/sites/default/files/2018-04/what-is-lorawan.pdf),
the proposed _Network Architecture_ for a LoRaWAN based system relies on a mesh
network architecture composed of _End nodes_, _Concentrators_, _Network Servers_
and _Application Servers_. This IoTA is fully compliant with this architecture,
providing interoperability between FIWARE NGSI Context Brokers and LoRaWAN
devices.

![General](https://raw.githubusercontent.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/master/docs/img/iotagent_lorawan_arch.png)

### Supported stacks

-   [The Things Network](https://www.thethingsnetwork.org/)
-   [LoRaServer](https://www.loraserver.io/)

### Data models

-   [CayenneLpp](https://www.thethingsnetwork.org/docs/devices/arduino/api/cayennelpp.html)
-   [CBOR](https://tools.ietf.org/html/rfc7049)
-   Proprietary format decoded by LoRaWAN application server.

## Install

### Requirements

-   [Node.js](https://nodejs.org/en/)
-   [MongoDB](https://docs.mongodb.com/manual/installation/)
-   [FIWARE Orion Context Broker](https://github.com/telefonicaid/fiware-orion)

### Cloning the Github repository

1. Clone the repository with the following command:

```console
git clone https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN.git
```

2. Once the repository is cloned, you have to download the dependencies for the
   project, and let it ready to the execution. From the root folder of the
   project execute:

```console
npm install
```

3. Launch the IoT Agent with the default configuration

```console
node bin/iotagent-lora
```

You can use a custom configuration file:

```console
node bin/iotagent-lora custom_config.js
```

The bootstrap process should finish with:

```bash
info: Loading devices from registry
info: LoRaWAN IoT Agent started
```

4. Check that the IoTA is running correctly:

```console
curl -v http://localhost:4061/iot/about
```

The result must be similar to:

```json
{ "libVersion": "2.6.0-next", "port": 4061, "baseRoot": "/" }
```

### Using Docker

A ready to use Docker image is
[provided](https://hub.docker.com/r/ioeari/iotagent-lora/)

```console
docker run -p 4061:4061 ioeari/iotagent-lora
```

### Using Docker-compose

This project contains an example to deploy the IoTA and all the requirement
using docker-compose.

```console
docker-compose -f docker/docker-compose.yml up
```

## Usage

Information about how to use the IoT Agent can be found in the
[User & Programmers Manual](https://fiware-lorawan.readthedocs.io/en/latest/users_manual/index.html).

## API

Apiary reference for the Configuration API can be found
[here](http://docs.telefonicaiotiotagents.apiary.io/#reference/configuration-api).
More information about IoT Agents and their APIs can be found in the IoT Agent
Library [documentation](https://iotagent-node-lib.rtfd.io/).

## Quality Assurance

This project is part of [FIWARE](https://fiware.org/) and has been rated as
follows:

-   **Version Tested:**
    ![ ](https://img.shields.io/badge/dynamic/json.svg?label=Version&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.version&colorB=blue)
-   **Documentation:**
    ![ ](https://img.shields.io/badge/dynamic/json.svg?label=Completeness&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.docCompleteness&colorB=blue)
    ![ ](https://img.shields.io/badge/dynamic/json.svg?label=Usability&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.docSoundness&colorB=blue)
-   **Responsiveness:**
    ![ ](https://img.shields.io/badge/dynamic/json.svg?label=Time%20to%20Respond&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.timeToCharge&colorB=blue)
    ![ ](https://img.shields.io/badge/dynamic/json.svg?label=Time%20to%20Fix&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.timeToFix&colorB=blue)
-   **FIWARE Testing:**
    ![ ](https://img.shields.io/badge/dynamic/json.svg?label=Tests%20Passed&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.failureRate&colorB=blue)
    ![ ](https://img.shields.io/badge/dynamic/json.svg?label=Scalability&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.scalability&colorB=blue)
    ![ ](https://img.shields.io/badge/dynamic/json.svg?label=Performance&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.performance&colorB=blue)
    ![ ](https://img.shields.io/badge/dynamic/json.svg?label=Stability&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.stability&colorB=blue)

---

## License

FIWARE IoT Agent for LoRaWAN protocol is licensed under Affero General Public
License (GPL) version 3.

© 2019 Atos Spain S.A

The following third-party library is used under license:

1. [iotagent-node-lib](https://github.com/telefonicaid/iotagent-node-lib) -
   **AGPL** © 2014-2019 Telefonica Investigación y Desarrollo
