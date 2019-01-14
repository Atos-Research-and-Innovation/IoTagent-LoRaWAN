# Tutorial using *The Things Network*

This is a step-by-step tutorial that will present in detail how to connect LoRaWAN end-nodes to [FIWARE LoRaWAN IoT Agent](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN) using [*The Things Network*](https://www.thethingsnetwork.org/) as the underlying LoRaWAN infrastructure. At the end of the process, LoRaWAN end-nodes will be connected to the IoT Agent and uplink data will be automatically published in a [FIWARE Orion Context Broker](https://github.com/telefonicaid/fiware-orion) using [NGSI data model](http://telefonicaid.github.io/fiware-orion/api/v2/stable/).

It must be noted that although most of the process described in the tutorial is directly applicable to any LoRaWAN compliant device, for the sake of the completeness of this document, [STM32 LoRa development boards](https://www.st.com/en/embedded-software/i-cube-lrwan.html) will be specifically considered.

## Prerequisites

### Environment and software
 - A single machine running a Linux based operating system, preferably Ubuntu 16.04.5 LTS or higher. All examples of RESTful commands provided in this tutorial will be meant to be executed from the same machine.
 - Docker version 18.06.1-ce or higher. Detailed installation instructions can be found [here](https://docs.docker.com/install/).
 - Docker Compose version 1.22.0 or higher. Detailed installation instructions can be found [here](https://docs.docker.com/compose/install/).
 - System Workbench for STM32 (aka SW4STM32). A free multi-OS software development environment based on Eclipse. Detailed installation instructions can be found [here](http://www.openstm32.org/HomePage).
 - Curl
 ````console
 $ sudo apt-get install curl
 ````
 - Git
````console
$ sudo apt-get install git
 ````
 - Minicom
````console
$ sudo apt-get install minicom
 ````

### *The Things Network* setup
 - The creation of an account in *The Things Network*: https://account.thethingsnetwork.org/
 - Registration of an application in *The Things Network*: https://www.thethingsnetwork.org/docs/applications/add.html

### Hardware

- An STM32 LoRa board: https://www.st.com/en/wireless-connectivity/lorawan-technology.html?querycriteria=productId=SC2150
	- Recommended board is [B-L072Z-LRWAN1](https://www.st.com/en/embedded-software/i-cube-lrwan.html), which is active and fully supported by STMicroelectronics.
- A LoRaWAN gateway (or access to it) compatible with *The Things Network*. Further information about this can be found [here](https://www.thethingsnetwork.org/docs/gateways/) . The Gateway should be registered in *The Things Network* following these [instructions](https://www.thethingsnetwork.org/docs/gateways/registration.html).

## Architecture

The tutorial allows the deployment of the following system, comprising a basic FIWARE IoT stack:

![Architecture](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/task/tutorialStm32TTN/docs/img/stm32_ttn_tutorial/stm32_ttn_tutorial_architecture.png)

- **A LoRaWAN end-node** based on an STM32 LoRaWAN development board. In particular, the B-L072Z-LRWAN1 model is used. The device will run an application reading the value from an onboard temperature sensor, encode the information using [CayenneLpp data model](https://www.thethingsnetwork.org/docs/devices/arduino/api/cayennelpp.html) and forward the result to **The Things Network** LoRaWAN stack through a *concentrator* or *gateway*.
- **The LoRaWAN gateway** plays the role of a concentrator which forwards the messages to the *LoRaWAN network server*, included in **The Things Network* stack.*
- **The Things Network* stack** implements the functionalities of the *LoRaWAN network server* and *LoRaWAN application server*. Development of applications is allowed through a [MQTT broker based API](https://www.thethingsnetwork.org/docs/applications/mqtt/api.html).
- **FIWARE IoT Agent** enables the ingestion of data from *LoRaWAN application servers* in *NGSI context brokers*, subscribing to appropriate communication channels (i.e., MQTT topics), decoding payloads and translating them to NGSI data model. It relies on a *MongoDB database* to persist information.
- **FIWARE Context Broker** manages large-scale context information abstracting the type of data source and the underlying communication technologies. It relies on a *MongoDB database* to persist information.

## Clone the GitHub repository

All the code and files needed to follow this tutorial are included in [FIWARE LoRaWAN IoT Agent GitHub repository](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN). To clone the repository:

``` console
$ git clone https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN.git
```

## Program the STM32 board

- Navigate to *https://console.thethingsnetwork.org* and get logged. Copy the *Application EUI* of one of the application to be used in the tutorial.

![TTN Application EUI](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/task/tutorialStm32TTN/docs/img/stm32_ttn_tutorial/ttn_application_eui.png)

- Launch SW4STM32 from the installation folder:
```console
$ <sw4stm32_path>/SystemWorkbench/eclipse
```
- When requested to select a directory as workspace, browse to: `examples/devices/stm32` folder. In the Project Explorer panel, right click and select Import ->General -> Existing Projects into Workspace. In the Import windows, click on Browse and on OK in the next window. Two different projects will be automatically selected. You can now click on Finish. The projects shall be imported.

![SW4STM32 setup](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/task/tutorialStm32TTN/docs/img/stm32_ttn_tutorial/eclipse_setup.gif)

- Open the file *Commissioning.h* within `Projects/B-L072Z-LRWAN1/Applications/LoRa/End_Node/LoRaWAN/App/inc/` path. Replace the value of `LORAWAN_JOIN_EUI` with the one copied from `TTN console`:

![Commissioning device](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/task/tutorialStm32TTN/docs/img/stm32_ttn_tutorial/stm32_ttn_commissioning.png)

- Select the project *mlm32l07x01* in the project explorer, and click on `Build Project` in the contextual menu. Please note that this project is valid for *B-L072Z-LRWAN1* board. *sx1272mb2das* project must be used for *P-NUCLEO-LRWAN1* board.

![SW4STM32 build](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/task/tutorialStm32TTN/docs/img/stm32_ttn_tutorial/eclipse_build.gif)

- Connect the *P-NUCLEO-LRWAN1* board to an available USB port. Run the following commands to check that it has been correctly recognized:

````console
$ lsusb
````

- The results should include a line similar to:

```console
Bus 002 Device 003: ID 0483:374b STMicroelectronics ST-LINK/V2.1 (Nucleo-F103RB)
```

- In the contextual menu of the project explorer, click on Target -> Erase chip ...
- In the contextual menu of the project explorer, click on Target -> Program chip ...
![SW4STM32 flash](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/task/tutorialStm32TTN/docs/img/stm32_ttn_tutorial/stm32_ttn_flash.gif)
- Open a new terminal and run:
````console
$ sudo minicom -D /dev/ttyACM0
````
- Reset the board and the following data shall be showed:
```console
VERSION: 44251210
OTAA
DevEui= 31-31-35-38-58-37-8A-18
AppEui= 70-B3-D5-7E-D0-00-98-5F
AppKey= 2B 7E 15 16 28 AE D2 A6 AB F7 15 88 09 CF 4F 3C
```
- Copy the values of `DevEui` and `AppKey`.
- Navigate to `https://console.thethingsnetwork.org/applications/test_fiware/devices/register` to register the device. Introduce the `Device ID`, the `Device EUI` (from previous step) and the `App Key` from previous step.

![TTN device resigster](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/task/tutorialStm32TTN/docs/img/stm32_ttn_tutorial/ttn_device_register.png)

## Deploy FIWARE stack

- From the root folder of the repository, run:

```console
$ docker-compose -f examples/stm32_ttn_tutorial/docker-compose.yml up
```

- The following results should be showed:

![Docker-compose up](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/task/tutorialStm32TTN/docs/img/stm32_ttn_tutorial/docker-compose-up.gif)

- In order to verify that the *FIWARE LoRaWAN IoT Agent* is running, execute:
```console
$ curl -X GET   http://localhost:4061/iot/about
```
- The output should be:
```json
{"libVersion":"2.6.0-next","port":4061,"baseRoot":"/"}
```
- In order to verify that the *FIWARE context broker* is running, execute:
```console
$ curl localhost:1026/version
```
- The output should be:
```json
{
"orion" : {
  "version" : "2.1.0-next",
  "uptime" : "0 d, 0 h, 17 m, 57 s",
  "git_hash" : "0f61fc575b869dcd26f2eae595424fa424f9bc28",
  "compile_time" : "Wed Dec 19 17:07:33 UTC 2018",
  "compiled_by" : "root",
  "compiled_in" : "07ff8fcb03f5",
  "release_date" : "Wed Dec 19 17:07:33 UTC 2018",
  "doc" : "https://fiware-orion.rtfd.io/"
}
}

```

## Provision LoRaWAN endnode and query context data

-In order to start using the IoTA, a new device must be provisioned. Execute the following command replacing *ApplicationId>, *ApplicationAccessKey*, *DeviceEUI* and *ApplicationEUI* with the appropriate values extracted in previous steps.

```console
curl -X POST \
  http://localhost:4061/iot/devices \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: atosioe' \
  -H 'fiware-servicepath: /lorattn' \
  -d '{
  "devices": [
    {
      "device_id": "<deviceID>",
      "entity_name": "LORA-DEVICE",
      "entity_type": "LoraDevice",
      "timezone": "America/Santiago",
      "attributes": [
        {
          "name": "temperature_1",
          "type": "Number"
        }
      ],
      "internal_attributes": {
        "lorawan": {
          "application_server": {
            "host": "eu.thethings.network",
            "username": "<ApplicationId>",
            "password": "<ApplicationAccessKey>",
            "provider": "TTN"
          },
          "dev_eui": "<DeviceEUI>",
          "app_eui": "<ApplicationEUI>",
          "application_id": "<ApplicationID>",
          "application_key": "2B7E151628AED2A6ABF7158809CF4F3C"
        }
      }
    }
  ]
}'
```

This command will create a simple LoRaWAN device, with just one declared active attributes: temperature.

- The list of provisioned devices can be retrieved with:

```console
curl -X GET \
  http://localhost:4061/iot/devices/ \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: atosioe' \
  -H 'fiware-servicepath: /lorattn'
```

- It should return something similar to:

```json
{
	"count": 1,
	"devices": [{
		"device_id": "lora-n-006",
		"service": "atosioe",
		"service_path": "/lorattn",
		"entity_name": "LORA-N-006",
		"entity_type": "LoraDevice",
		"attributes": [{
			"object_id": "temperature_1",
			"name": "temperature_1",
			"type": "Number"
		}],
		"lazy": [],
		"commands": [],
		"static_attributes": [],
		"internal_attributes": {
			"lorawan": {
				"application_key": "2B7E151628AED2A6ABF7158809CF4F3C",
				"application_id": "ari_ioe_app_demo1",
				"app_eui": "70B3D57ED000985F",
				"dev_eui": "3131353858378A18",
				"application_server": {
					"provider": "TTN",
					"host": "mosquitto"
				}
			}
		}
	}]
}
```

## Data visualization 

## FAQ

### Linux operating system using Oracle VirtualBox

https://superuser.com/questions/683034/oracle-virtualbox-connecting-usb-device