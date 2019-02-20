# Installation & Administration Guide

-   [Installation](#installation)
-   [Configuration](#configuration)

## Installation

There are two ways of installing the JSON IoT Agent: using Git or Docker image.

### Using GIT

In order to install the LoRaWAN IoT Agent, just clone the project and install the dependencies:

#### Requirements

-   [Node.js](https://nodejs.org/en/)
-   [MongoDB](https://docs.mongodb.com/manual/installation/)
-   [FIWARE Orion Context Broker](https://github.com/telefonicaid/fiware-orion)

#### Cloning the GitHub repository

1.  Clone the repository with the following command:

```bash
git clone https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN.git
```

2.  Once the repository is cloned, you have to download the dependencies for the project, and let it ready to the
    execution. From the root folder of the project execute:

```bash
npm install
```

3.  Launch the IoT Agent with the default configuration

```bash
node bin/iotagent-lora
```

You can use a custom configuration file:

```bash
node bin/iotagent-lora custom_config.js
```

The bootstrap process should finish with:

```bash
info: Loading devices from registry
info: LoRaWAN IoT Agent started
```

4.  Check that the IoTA is running correctly:

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

#### Using Docker-compose

This project contains an example to deploy the IoTA and all the requirement using docker-compose.

```bash
docker-compose -f docker/docker-compose.yml up
```

## Configuration

#### Overview

All the configuration for the IoT Agent is stored in a single configuration file (typically installed in the root
folder). Please refer to the `Static configuration`section of [user guide](users_manual.md) for further information.

#### Configuration with environment variables

Some of the more common variables can be configured using environment variables. The ones overriding general parameters
in the `config.iota` set are described in the
[IoTA Library Configuration manual](https://github.com/telefonicaid/iotagent-node-lib#configuration).
