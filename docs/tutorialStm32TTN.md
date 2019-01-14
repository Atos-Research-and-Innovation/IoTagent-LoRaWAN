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


## FAQ

### Linux operating system using Oracle VirtualBox

https://superuser.com/questions/683034/oracle-virtualbox-connecting-usb-device