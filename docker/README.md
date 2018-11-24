# FIWARE IoT Agent for the LoRaWaN Protocol

[![FIWARE IoT Agents](https://nexus.lab.fiware.org/static/badges/chapters/iot-agents.svg)](https://www.fiware.org/developers/catalogue/)
[![](https://img.shields.io/badge/tag-fiware+iot-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware+iot)

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

## How to use this image

The IoT Agent must be instantiated and connected to an instance of the [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/), a sample `docker-compose` file can be found below. If the
`IOTA_REGISTRY_TYPE=mongodb`, a [MongoDB](https://www.mongodb.com/) database instance is also required.

```yml
version: '3.1'

volumes:
  mongodb:

services:
  iot-agent:
    image: ioeari/iotagent-lora
    hostname: iot-agent
    container_name: fiware-iot-agent
    depends_on:
        - mongo-db
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
    image: fiware/orion:2.0.0
    hostname: orion
    container_name: fiware-orion
    depends_on:
        - mongodb
    networks:
        - default
    expose:
        - "1026"
    ports:
        - "1026:1026"
    command: -dbhost mongodb
```




## Configuration with environment variables

Some of the more common variables can be configured using environment variables. The ones overriding general parameters
in the `config.iota` set are described in the [IoTA Library Configuration manual](https://github.com/telefonicaid/iotagent-node-lib#configuration).


More details, and further settings can be found within the IoT Agent for LoRaWAN [documentation](https://fiware-lorawan.readthedocs.io/en/latest/) itself.

## How to build your own image

The [Dockerfile](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docker/Dockerfile) associated with this image can be used to build an image in several ways:

* By default, the `Dockerfile` retrieves the **latest** version of the codebase direct from GitHub (the `build-arg` is optional):

```console
docker build -t iot-agent . --build-arg DOWNLOAD_TYPE=latest
```

* You can alter this to obtain the last **stable** release run this `Dockerfile` with the build argument `DOWNLOAD_TYPE=stable`

```console
docker build -t iot-agent . --build-arg DOWNLOAD_TYPE=stable
```

* You can also alter this to download code from your own fork of the GitHub repository by adding `GITHUB_ACCOUNT` and `GITHUB_REPOSITORY` arguments

```console
docker build -t iot-agent . --build-arg GITHUB_ACCOUNT=<your account> --build-arg GITHUB_REPOSITORY=<your repo>
```

If you want to build directly from your own sources, please copy the ` Dockerfile` into file the root of the repository and amend it to
copy over your local source using :

```
COPY . /opt/iotagent-lora/
```

Full instructions can be found within the `Dockerfile` itself.
