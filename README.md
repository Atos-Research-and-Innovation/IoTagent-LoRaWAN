# FIWARE IoT Agent for LoRaWAN protocol

[![FIWARE IoT Agents](https://img.shields.io/badge/FIWARE-IoT_Agents-5dc0cf.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAVCAYAAAC33pUlAAAABHNCSVQICAgIfAhkiAAAA8NJREFUSEuVlUtIFlEUx+eO+j3Uz8wSLLJ3pBiBUljRu1WLCAKXbXpQEUFERSQF0aKVFAUVrSJalNXGgmphFEhQiZEIPQwKLbEUK7VvZrRvbr8zzjfNl4/swplz7rn/8z/33HtmRhn/MWzbXmloHVeG0a+VSmAXorXS+oehVD9+0zDN9mgk8n0sWtYnHo5tT9daH4BsM+THQC8naK02jCZ83/HlKaVSzBey1sm8BP9nnUpdjOfl/Qyzj5ust6cnO5FItJLoJqB6yJ4QuNcjVOohegpihshS4F6S7DTVVlNtFFxzNBa7kcaEwUGcbVnH8xOJD67WG9n1NILuKtOsQG9FngOc+lciic1iQ8uQGhJ1kVAKKXUs60RoQ5km93IfaREvuoFj7PZsy9rGXE9G/NhBsDOJ63Acp1J82eFU7OIVO1OxWGwpSU5hb0GqfMydMHYSdiMVnncNY5Vy3VbwRUEydvEaRxmAOSSqJMlJISTxS9YWTYLcg3B253xsPkc5lXk3XLlwrPLuDPKDqDIutzYaj3eweMkPeCCahO3+fEIF8SfLtg/5oI3Mh0ylKM4YRBaYzuBgPuRnBYD3mmhA1X5Aka8NKl4nNz7BaKTzSgsLCzWbvyo4eK9r15WwLKRAmmCXXDoA1kaG2F4jWFbgkxUnlcrB/xj5iHxFPiBN4JekY4nZ6ccOiQ87hgwhe+TOdogT1nfpgEDTvYAucIwHxBfNyhpGrR+F8x00WD33VCNTOr/Wd+9C51Ben7S0ZJUq3qZJ2OkZz+cL87ZfWuePlwRcHZjeUMxFwTrJZAJfSvyWZc1VgORTY8rBcubetdiOk+CO+jPOcCRTF+oZ0okUIyuQeSNL/lPrulg8flhmJHmE2gBpE9xrJNkwpN4rQIIyujGoELCQz8ggG38iGzjKkXufJ2Klun1iu65bnJub2yut3xbEK3UvsDEInCmvA6YjMeE1bCn8F9JBe1eAnS2JksmkIlEDfi8R46kkEkMWdqOv+AvS9rcp2bvk8OAESvgox7h4aWNMLd32jSMLvuwDAwORSE7Oe3ZRKrFwvYGrPOBJ2nZ20Op/mqKNzgraOTPt6Bnx5citUINIczX/jUw3xGL2+ia8KAvsvp0ePoL5hXkXO5YvQYSFAiqcJX8E/gyX8QUvv8eh9XUq3h7mE9tLJoNKqnhHXmCO+dtJ4ybSkH1jc9XRaHTMz1tATBe2UEkeAdKu/zWIkUbZxD+veLxEQhhUFmbnvOezsJrk+zmqMo6vIL2OXzPvQ8v7dgtpoQnkF/LP8Ruu9zXdJHg4igAAAABJRU5ErkJgggA=)](https://www.fiware.org/developers/catalogue/)
[![License: APGL](https://img.shields.io/github/license/Atos-Research-and-Innovation/IoTagent-LoRaWAN.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Documentation badge](https://img.shields.io/readthedocs/fiware-lorawan.svg)](http://fiware-lorawan.readthedocs.io/en/latest/?badge=latest)
[![Docker](https://img.shields.io/docker/pulls/fiware/iotagent-lorawan.svg)](https://hub.docker.com/r/fiware/iotagent-lorawan/)
[![](https://img.shields.io/badge/tag-fiware+iot-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware+iot)
[![Build Status](https://img.shields.io/travis/Atos-Research-and-Innovation/IoTagent-LoRaWAN.svg?branch=master)](https://travis-ci.org/Atos-Research-and-Innovation/IoTagent-LoRaWAN/branches)

Copyright 2018 Atos Spain S.A

FIWARE *Internet of Things* Agent for LoRaWAN protocol enables data and commands to be exchanged between IoT devices and [FIWARE NGSI Context Brokers](https://forge.fiware.org/plugins/mediawiki/wiki/fiware/index.php/FIWARE.OpenSpecification.Data.ContextBroker) using [LoRaWAN](https://lora-alliance.org/about-lorawan) protocol.

It is based on the [FIWARE IoT Agent Node.js Library](https://github.com/telefonicaid/iotagent-node-lib). Further general information about FIWARE IoT Agents framework, its architecture and interaction model can be found in this repository.

This project is part of [FIWARE](https://www.fiware.org/). Check also the FIWARE Catalogue entry for the [IoTAgents](https://catalogue.fiware.org/enablers/backend-device-management-idas).

## Description

### Architecture

As it is explained in [What is LoRaWAN™](https://lora-alliance.org/sites/default/files/2018-04/what-is-lorawan.pdf), the proposed *Network Architecture* for a LoRaWAN based system relies on a mesh network architecture composed of *End nodes*, *Concentrators*, *Network Servers* and *Application Servers*. This IoTA is fully compliant with this architecture, providing interoperability between FIWARE NGSI Context Brokers and LoRaWAN devices.

![General](https://raw.githubusercontent.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/master/docs/img/iotagent_lorawan_arch.png)

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

Copyright 2018 Atos Spain S.A
