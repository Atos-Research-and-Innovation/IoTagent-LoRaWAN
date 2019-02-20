# FIWARE IoT Agent for the LoRaWaN Protocol

[![FIWARE IoT Agents](https://nexus.lab.fiware.org/static/badges/chapters/iot-agents.svg)](https://www.fiware.org/developers/catalogue/)
[![License: APGL](https://img.shields.io/github/license/Atos-Research-and-Innovation/IoTagent-LoRaWAN.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Docker](https://img.shields.io/docker/pulls/fiware/iotagent-lorawan.svg)](https://hub.docker.com/r/fiware/iotagent-lorawan/)
[![](https://img.shields.io/badge/tag-fiware+iot-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware+iot)
<br>
[![Documentation badge](https://img.shields.io/readthedocs/fiware-lorawan.svg)](http://fiware-lorawan.readthedocs.io/en/latest/?badge=latest)
[![Build Status](https://img.shields.io/travis/Atos-Research-and-Innovation/IoTagent-LoRaWAN.svg?branch=master)](https://travis-ci.org/Atos-Research-and-Innovation/IoTagent-LoRaWAN/branches)
[![Coverage Status](https://coveralls.io/repos/github/Atos-Research-and-Innovation/IoTagent-LoRaWAN/badge.svg?branch=master)](https://coveralls.io/github/Atos-Research-and-Innovation/IoTagent-LoRaWAN?branch=master)
![Status](https://nexus.lab.fiware.org/static/badges/statuses/iot-lorawan.svg)

The Internet of Things Agent for LoRaWAN protocol enables data and commands to be exchanged between IoT devices and the
[NGSI](https://swagger.lab.fiware.org/?url=https://raw.githubusercontent.com/Fiware/specifications/master/OpenAPI/ngsiv2/ngsiv2-openapi.json)
interface of a context broker using the [LoRaWAN](https://lora-alliance.org/about-lorawan) protocol.

It is based on the [IoT Agent Node.js Library](https://github.com/telefonicaid/iotagent-node-lib). Further general
information about the FIWARE IoT Agents framework, its architecture and the common interaction model can be found in the
library's GitHub repository.

This project is part of [FIWARE](https://www.fiware.org/). For more information check the FIWARE Catalogue entry for the
[IoT Agents](https://github.com/Fiware/catalogue/tree/master/iot-agents).

| :books: [Documentation](https://fiware-lorawan.readthedocs.io) | :mortar_board: [Academy](https://fiware-academy.readthedocs.io/en/latest/iot-agents/idas) | :whale: [Docker Hub](https://hub.docker.com/r/fiware/iotagent-lorawan/) | :dart: [Roadmap](docs/roadmap.md) |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------- |


## Contents

-   [Background](#background)
-   [Install](#install)
-   [Usage](#usage)
-   [API](#api)
-   [Roadmap](#roadmap)
-   [Quality Assurance](#quality-assurance)
-   [License](#license)

## Background

### Architecture

As explained in [What is LoRaWAN™](https://lora-alliance.org/sites/default/files/2018-04/what-is-lorawan.pdf), the
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
-   Proprietary format decoded by LoRaWAN application server.

## Install

Information about how to install the LoRaWAN IoT Agent can be found at the corresponding section of the
[Installation & Administration Guide](docs/installationguide.md).

A `Dockerfile` is also available for your use - further information can be found [here](docker/README.md)

## Usage

Information about how to use the IoT Agent can be found in the
[User & Programmers Manual](https://fiware-lorawan.readthedocs.io/en/latest/users_manual/index.html).

## API

Apiary reference for the Configuration API can be found
[here](http://docs.telefonicaiotiotagents.apiary.io/#reference/configuration-api). More information about IoT Agents and
their APIs can be found in the IoT Agent Library [documentation](https://iotagent-node-lib.rtfd.io/).

## Roadmap

The roadmap of this FIWARE GE is described [here](docs/roadmap.md)

## Quality Assurance

This project is part of [FIWARE](https://fiware.org/) and has been rated as follows:

-   **Version Tested:**
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Version&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.version&colorB=blue)
-   **Documentation:**
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Completeness&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.docCompleteness&colorB=blue)
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Usability&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.docSoundness&colorB=blue)
-   **Responsiveness:**
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Time%20to%20Respond&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.timeToCharge&colorB=blue)
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Time%20to%20Fix&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.timeToFix&colorB=blue)
-   **FIWARE Testing:**
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Tests%20Passed&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.failureRate&colorB=blue)
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Scalability&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.scalability&colorB=blue)
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Performance&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.performance&colorB=blue)
    ![](https://img.shields.io/badge/dynamic/json.svg?label=Stability&url=https://fiware.github.io/catalogue/json/iotagent_LoRa.json&query=$.stability&colorB=blue)

---

## License

FIWARE IoT Agent for LoRaWAN protocol is licensed under [Affero General Public License (GPL) version 3](./LICENSE).

© 2019 Atos Spain S.A

The following third-party library is used under license:

1.  [iotagent-node-lib](https://github.com/telefonicaid/iotagent-node-lib) - **AGPL** © 2014-2019 Telefonica
    Investigación y Desarrollo

### Are there any legal issues with AGPL 3.0? Is it safe for me to use?

There is absolutely no problem in using a product licensed under AGPL 3.0. Issues with GPL (or AGPL) licenses are mostly
related with the fact that different people assign different interpretations on the meaning of the term “derivate work”
used in these licenses. Due to this, some people believe that there is a risk in just _using_ software under GPL or AGPL
licenses (even without _modifying_ it).

For the avoidance of doubt, the owners of this software licensed under an AGPL-3.0 license wish to make a clarifying
public statement as follows:

> Please note that software derived as a result of modifying the source code of this software in order to fix a bug or
> incorporate enhancements is considered a derivative work of the product. Software that merely uses or aggregates (i.e.
> links to) an otherwise unmodified version of existing software is not considered a derivative work, and therefore it
> does not need to be released as under the same license, or even released as open source.
