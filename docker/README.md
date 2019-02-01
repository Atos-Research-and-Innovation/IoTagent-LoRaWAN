# FIWARE IoT Agent for the LoRaWaN Protocol

[![FIWARE IoT Agents](https://nexus.lab.fiware.org/static/badges/chapters/iot-agents.svg)](https://www.fiware.org/developers/catalogue/)
[![](https://img.shields.io/badge/tag-fiware+iot-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware+iot)

The Internet of Things Agent for LoRaWAN protocol enables data and commands to be exchanged between IoT devices and the
[NGSI](https://swagger.lab.fiware.org/?url=https://raw.githubusercontent.com/Fiware/specifications/master/OpenAPI/ngsiv2/ngsiv2-openapi.json)
interface of a context broker using the [LoRaWAN](https://lora-alliance.org/about-lorawan) protocol.

It is based on the [IoT Agent Node.js Library](https://github.com/telefonicaid/iotagent-node-lib). Further general
information about the FIWARE IoT Agents framework, its architecture and the common interaction model can be found in the
library's GitHub repository.

This project is part of [FIWARE](https://www.fiware.org/). For more information check the FIWARE Catalogue entry for the
[IoT Agents](https://github.com/Fiware/catalogue/tree/master/iot-agents).

## How to use this image

The IoT Agent must be instantiated and connected to an instance of the
[Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/), a sample `docker-compose` file can be found
below.

If the `IOTA_REGISTRY_TYPE=mongodb`, a [MongoDB](https://www.mongodb.com/) database instance is also required - the
example below assumes that you have a `/data` directory in your hosting system in order to hold database files - please
amend the attached volume to suit your own configuration.

```yaml
version: "3.1"

services:
    iot-agent:
        image: ioeari/iotagent-lora
        hostname: iot-agent
        container_name: fiware-iot-agent
        depends_on:
            - mongodb
        expose:
            - "4041"
        ports:
            - "4041:4041"
        environment:
            - "IOTA_CB_HOST=orion"
            - "IOTA_CB_PORT=1026"
            - "IOTA_NORTH_PORT=4041"
            - "IOTA_REGISTRY_TYPE=mongodb"
            - "IOTA_MONGO_HOST=mongo-db"
            - "IOTA_MONGO_PORT=27017"
            - "IOTA_MONGO_DB=iotagent-lorawan"
            - "IOTA_PROVIDER_URL=http://iot-agent:4041"

    mongodb:
        image: mongo:3.6
        hostname: mongo-db
        container_name: db-mongo
        ports:
            - "27017:27017"
        command: --bind_ip_all --smallfiles
        volumes:
            - mongodb:/data

    orion:
        image: fiware/orion
        hostname: orion
        container_name: fiware-orion
        depends_on:
            - mongodb
        expose:
            - "1026"
        ports:
            - "1026:1026"
        command: -dbhost mongodb

    volumes:
        mongo-db: ~
```

## Configuration with environment variables

Many settings can be configured using Docker environment variables. A typical IoT Agent Docker container is driven by
environment variables such as those shown below:

-   `IOTA_CB_HOST` - Hostname of the context broker to update context
-   `IOTA_CB_PORT` - Port that context broker listens on to update context
-   `IOTA_NORTH_PORT` - Port used for configuring the IoT Agent and receiving context updates from the context broker
-   `IOTA_REGISTRY_TYPE` - Whether to hold IoT device info in memory or in a database
-   `IOTA_MONGO_HOST` - The hostname of MongoDB - used for holding device and service information
-   `IOTA_MONGO_PORT` - The port that MongoDB is listening on
-   `IOTA_MONGO_DB` - The name of the database used in MongoDB
-   `IOTA_PROVIDER_URL` - URL passed to the Context Broker when commands are registered, used as a forwarding URL
    location when the Context Broker issues a command to a device

### Further Information

The full set of overrides for the general parameters applicable to all IoT Agents are described in the Configuration
section of the IoT Agent Library
[Installation Guide](https://iotagent-node-lib.readthedocs.io/en/latest/installationguide/index.html#configuration).

Further settings for the IoT Agent for the LoRaWaN Protocol itself - such as specific configurations for the LoRaWaN
Protocol - can be found in the IoT Agent for the LoRaWaN Protocol
[Users Guide](https://fiware-lorawan.readthedocs.io/en/latest/users_manual/index.html#configuration-provisioning).

## How to build your own image

The [Dockerfile](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docker/Dockerfile)
associated with this image can be used to build an image in several ways:

-   By default, the `Dockerfile` retrieves the **latest** version of the codebase direct from GitHub (the `build-arg` is
    optional):

```console
docker build -t iot-agent . --build-arg DOWNLOAD=latest
```

-   You can alter this to obtain the last **stable** release run this `Dockerfile` with the build argument
    `DOWNLOAD=stable`

```console
docker build -t iot-agent . --build-arg DOWNLOAD=stable
```

-   You can also download a specific release by running this `Dockerfile` with the build argument `DOWNLOAD=<version>`

```console
docker build -t iot-agent . --build-arg DOWNLOAD=1.7.0
```

-   To download code from your own fork of the GitHub repository add the `GITHUB_ACCOUNT` and `GITHUB_REPOSITORY`
    arguments to the `docker build` command.

```console
docker build -t iot-agent . --build-arg GITHUB_ACCOUNT=<your account> --build-arg GITHUB_REPOSITORY=<your repo>
```

Alternatively, if you want to build directly from your own sources, please copy the existing `Dockerfile` into file the
root of the repository and amend it to copy over your local source using :

```Dockerfile
COPY . /opt/iotagent-lora/
```

Full instructions can be found within the `Dockerfile` itself.
