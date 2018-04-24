# FIWARE IoT Agent for LoRaWAN protocol

FIWARE *Internet of Things* Agent for LoRaWAN protocol enables data and commands to be exchanged between IoT devices and [FIWARE NGSI Context Brokers](https://forge.fiware.org/plugins/mediawiki/wiki/fiware/index.php/FIWARE.OpenSpecification.Data.ContextBroker) using [LoRaWAN](https://lora-alliance.org/about-lorawan) protocol.

It is based on the [FIWARE IoT Agent Node.js Library](https://github.com/telefonicaid/iotagent-node-lib). Further general information about FIWARE IoT Agents framework, its architecture and interaction model can be found in this repository.

This project is part of [FIWARE](https://www.fiware.org/). Check also the FIWARE Catalogue entry for the [IoTAgents](https://catalogue.fiware.org/enablers/backend-device-management-idas).

## Description

### Architecture

As it is explained in [What is LoRaWAN™](https://lora-alliance.org/sites/default/files/2018-04/what-is-lorawan.pdf), the proposed *Network Architecture* for a LoRaWAN based system relies on a mesh network architecture composed of *End nodes*, *Concentrators*, *Network Servers* and *Application Servers*. This IoTA is fully compliant with this architecture, providing interoperability between FIWARE NGSI Context Brokers and LoRaWAN devices.

![alt text](https://github.com/dcalvoalonso/IoTagent-LoRaWAN/blob/task/initialDocumentation/docs/img/iotagent_lorawan_arch.png)

### Supported stacks

- [The Things Network](https://www.thethingsnetwork.org/)

### Data models

- [CayenneLpp](https://www.thethingsnetwork.org/docs/devices/arduino/api/cayennelpp.html)
- [CBOR](https://tools.ietf.org/html/rfc7049)

## Installation

## Users manual

## Development documentation

## License 

FIWARE IoT Agent for LoRaWAN protocol is licensed under Affero General Public License (GPL) version 3.
