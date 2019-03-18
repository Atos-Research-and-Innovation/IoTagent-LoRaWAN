# Tutorial using _The Things Network_

This is a step-by-step tutorial that will present in detail how to connect LoRaWAN end-nodes to
[FIWARE LoRaWAN IoT Agent](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN) using
[_The Things Network_](https://www.thethingsnetwork.org/) as the underlying LoRaWAN infrastructure. At the end of the
process, LoRaWAN end-nodes will be connected to the IoT Agent and uplink data will be automatically published in a
[FIWARE Orion Context Broker](https://github.com/telefonicaid/fiware-orion) using
[NGSI data model](http://telefonicaid.github.io/fiware-orion/api/v2/stable/).

It must be noted that although most of the process described in the tutorial is directly applicable to any LoRaWAN
compliant device, for the sake of the completeness of this document,
[STM32 LoRa development boards](https://www.st.com/en/embedded-software/i-cube-lrwan.html) will be specifically
considered.

## Prerequisites

### Environment and software

-   A single machine running a Linux based operating system, preferably Ubuntu 16.04.5 LTS or higher. All examples of
    RESTful commands provided in this tutorial will be meant to be executed from the same machine.
-   Docker version 18.06.1-ce or higher. Detailed installation instructions can be found
    [here](https://docs.docker.com/install/).
-   Docker Compose version 1.22.0 or higher. Detailed installation instructions can be found
    [here](https://docs.docker.com/compose/install/).
-   System Workbench for STM32 (aka SW4STM32). A free multi-OS software development environment based on Eclipse.
    Detailed installation instructions can be found [here](http://www.openstm32.org/HomePage).
-   Curl

```bash
sudo apt-get install curl
```

-   Git

```bash
sudo apt-get install git
```

-   Minicom

```bash
sudo apt-get install minicom
```

### _The Things Network_ setup

-   The creation of an account in _The Things Network_: `https://account.thethingsnetwork.org/`
-   Registration of an application in _The Things Network_:
    `https://www.thethingsnetwork.org/docs/applications/add.html`

### Hardware

-   An STM32 LoRa board:
    `https://www.st.com/en/wireless-connectivity/lorawan-technology.html?querycriteria=productId=SC2150` - Recommended
    board is [B-L072Z-LRWAN1](https://www.st.com/en/embedded-software/i-cube-lrwan.html), which is active and fully
    supported by STMicroelectronics.
-   A LoRaWAN gateway (or access to it) compatible with _The Things Network_. Further information about this can be
    found [here](https://www.thethingsnetwork.org/docs/gateways/) . The Gateway should be registered in _The Things
    Network_ following these [instructions](https://www.thethingsnetwork.org/docs/gateways/registration.html).

## Architecture

The tutorial allows the deployment of the following system, comprising a basic FIWARE IoT stack:

![Architecture](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/stm32_ttn_tutorial_architecture.png)

-   **A LoRaWAN end-node** based on an STM32 LoRaWAN development board. In particular, the B-L072Z-LRWAN1 model is used.
    The device will run an application reading the value from an onboard temperature sensor, encode the information
    using [CayenneLpp data model](https://www.thethingsnetwork.org/docs/devices/arduino/api/cayennelpp.html) and forward
    the result to **The Things Network** LoRaWAN stack through a _concentrator_ or _gateway_.
-   **The LoRaWAN gateway** plays the role of a concentrator which forwards the messages to the _LoRaWAN network
    server_, included in \*_The Things Network_ stack.\*
-   **The Things Network\* stack** implements the functionalities of the _LoRaWAN network server_ and _LoRaWAN
    application server_. Development of applications is allowed through a
    [MQTT broker based API](https://www.thethingsnetwork.org/docs/applications/mqtt/api.html).
-   **FIWARE IoT Agent** enables the ingestion of data from _LoRaWAN application servers_ in _NGSI context brokers_,
    subscribing to appropriate communication channels (i.e., MQTT topics), decoding payloads and translating them to
    NGSI data model. It relies on a _MongoDB database_ to persist information.
-   **FIWARE Context Broker** manages large-scale context information abstracting the type of data source and the
    underlying communication technologies. It relies on a _MongoDB database_ to persist information.
-   **FIWARE Quantum Leap** subscribes to notifications of new data ingested by _FIWARE Context Brokers_ and stores the
    historical information in time-series format. It relies on a _CrateDB database_ to persist information.
-   **Grafana** provides an easy and intuitive mechanism to visualize and explore data by means of fashionable
    dashboards.

## Clone the GitHub repository

All the code and files needed to follow this tutorial are included in
[FIWARE LoRaWAN IoT Agent GitHub repository](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN). To clone
the repository:

```bash
git clone https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN.git
```

## Program the STM32 board

-   Navigate to `https://console.thethingsnetwork.org` and get logged. Copy the _Application EUI_ of one of the
    application to be used in the tutorial.

![TTN Application EUI](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/ttn_application_eui.png)

-   Launch SW4STM32 from the installation folder:

```bash
<sw4stm32_path>/SystemWorkbench/eclipse
```

-   When requested to select a directory as the workspace, browse to: `examples/devices/stm32` folder. In the Project
    Explorer panel, right click and select Import ->General -> Existing Projects into Workspace. In the Import windows,
    click on Browse and on OK in the next window. Two different projects will be automatically selected. You can now
    click on Finish. The projects shall be imported.

![SW4STM32 setup](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/eclipse_setup.gif)

-   _mlm32l07x01_ shall be used for _B-L072Z-LRWAN1_. _sx1272mb2das_ must be used for _P-NUCLEO-LRWAN1_ board.

-   In the Project Explorer, check last folder within `Includes`:
    `Projects/B-L072Z-LRWAN1/Applications/LoRa/End_Node/LoRaWAN/App/inc/`. Open the file _Commissioning.h_ and replace
    the value of `LORAWAN_JOIN_EUI` with the one copied from `TTN console`:

![Commissioning device](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/stm32_ttn_commissioning.png)

-   Select the project _mlm32l07x01_ in the project explorer, and click on `Build Project` in the contextual menu.
    Please note that this project is valid for _B-L072Z-LRWAN1_ board. _sx1272mb2das_ project must be used for
    _P-NUCLEO-LRWAN1_ board.

![SW4STM32 build](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/eclipse_build.gif)

-   Connect the _P-NUCLEO-LRWAN1_ board to an available USB port. In a terminal, run the following commands to check
    that it has been correctly recognized:

```bash
lsusb
```

-   The results should include a line similar to:

```bash
Bus 002 Device 003: ID 0483:374b STMicroelectronics ST-LINK/V2.1 (Nucleo-F103RB)
```

-   In the contextual menu of the project explorer, click on Target -> Erase chip ...
-   In the contextual menu of the project explorer, click on Target -> Program chip ...
    ![SW4STM32 flash](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/stm32_ttn_flash.gif)
-   Open a new terminal and run:

```bash
sudo minicom -D /dev/ttyACM0
```

-   Reset the board by pressing the button with the label `RESET` and the following data shall be shown in the terminal:

```bash
VERSION: 44251210
OTAA
DevEui= 31-31-35-38-58-37-8A-18
AppEui= 70-B3-D5-7E-D0-00-98-5F
AppKey= 2B 7E 15 16 28 AE D2 A6 AB F7 15 88 09 CF 4F 3C
```

-   Copy the values of `DevEui` and `AppKey`.
-   Navigate to `https://console.thethingsnetwork.org/applications` to register the device. Introduce the `Device ID`,
    the `Device EUI` (from the previous step) and the `App Key` (from the previous step).

![TTN device resigster](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/ttn_device_register.png)

-   If the endnode can get connected to a _LoRaWAN gateway_, after some time, data shall start being received by
    `The Things Network console`:

![TTN device data](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/ttn_console_data.png)

## Deploy FIWARE stack

-   The `FIWARE stack` include a `CrateDB instance`. This component requires to increase the virtual memory asigned by
    default to `mmap`. Execute:

```bash
sudo sysctl -w vm.max_map_count=262144
```

-   From the root folder of the repository, run:

```bash
docker-compose -f examples/stm32_ttn_tutorial/docker-compose.yml up
```

-   The following results should be shown:

![Docker-compose up](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/docker-compose-up.gif)

-   In order to verify that the _FIWARE LoRaWAN IoT Agent_ is running, execute:

```bash
curl -X GET   http://localhost:4061/iot/about
```

-   The output should be:

```json
{ "libVersion": "2.6.0-next", "port": 4061, "baseRoot": "/" }
```

-   In order to verify that the _FIWARE context broker_ is running, execute:

```bash
curl localhost:1026/version
```

-   The output should be:

```json
{
    "orion": {
        "version": "2.1.0-next",
        "uptime": "0 d, 0 h, 17 m, 57 s",
        "git_hash": "0f61fc575b869dcd26f2eae595424fa424f9bc28",
        "compile_time": "Wed Dec 19 17:07:33 UTC 2018",
        "compiled_by": "root",
        "compiled_in": "07ff8fcb03f5",
        "release_date": "Wed Dec 19 17:07:33 UTC 2018",
        "doc": "https://fiware-orion.rtfd.io/"
    }
}
```

## Provision LoRaWAN endnode and query FIWARE context data

-In order to start using the IoTA, a new device must be provisioned. Execute the following command replacing
_ApplicationId_, _ApplicationAccessKey_, _DeviceEUI_ and _ApplicationEUI_ with the appropriate values extracted in
previous steps.

```bash
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

This command will create a simple LoRaWAN device, with just one declared active attribute: temperature.

-   The list of provisioned devices can be retrieved with:

```bash
curl -X GET \
  http://localhost:4061/iot/devices/ \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: atosioe' \
  -H 'fiware-servicepath: /lorattn'
```

-   It should return something similar to:

```json
{
    "count": 1,
    "devices": [
        {
            "device_id": "lora-n-006",
            "service": "atosioe",
            "service_path": "/lorattn",
            "entity_name": "LORA-DEVICE",
            "entity_type": "LoraDevice",
            "attributes": [
                {
                    "object_id": "temperature_1",
                    "name": "temperature_1",
                    "type": "Number"
                }
            ],
            "lazy": [],
            "commands": [],
            "static_attributes": [],
            "internal_attributes": {
                "lorawan": {
                    "application_key": "2B7E151628AED2A6ABF7158809CF4F3C",
                    "application_id": "app_demo1",
                    "app_eui": "70B3D47ED440985F",
                    "dev_eui": "9931353858378A18",
                    "application_server": {
                        "provider": "TTN",
                        "host": "mosquitto"
                    }
                }
            }
        }
    ]
}
```

-   When the endnode publishes temperature data periodically, the information will be received by the _FIWARE IoT Agent_
    through the _The Things Network MQTT API_. It will decode the CayenneLpp payload, transform it to NGSI data model
    and forward the result to the _FIWARE Context Broker_.
-   It is possible to check that the whole data flow is working correctly by calling the API of the _Context Broker_:

```bash
curl -X GET \
  http://localhost:1026/v2/entities \
  -H 'fiware-service: atosioe' \
  -H 'fiware-servicepath: /lorattn'
```

-   The result should be similar to:

```json
[
    {
        "id": "LORA-DEVICE",
        "type": "LoraDevice",
        "TimeInstant": {
            "type": "DateTime",
            "value": "2019-01-14T13:45:19.00Z",
            "metadata": {}
        },
        "temperature_1": {
            "type": "Number",
            "value": 27.2,
            "metadata": {
                "TimeInstant": {
                    "type": "DateTime",
                    "value": "2019-01-14T13:45:19.00Z"
                }
            }
        }
    }
]
```

-   As it can be seen, the data extracted from _FIWARE Context Broker_ is represented using _NGSI data model_, being a
    standardized representation independent of the underlying LoRaWAN communication protocol and the payload encoding
    format.

## Data storage and visualization

_FIWARE Orion Context Broker_ stores the last value for each one of the attributes of the registered entities. To
maintain a record of historical information, _FIWARE Quantum Leap_ component is used. It is based on _CrateDB_ which can
be easily integrated with _Grafana_ for visualization purposes.

### Data storage using _FIWARE Quantum Leap_

-   To check that _Quantum Leap_ has been correctly launched execute:

```bash
curl -X GET http://localhost:8668/v2/version
```

-   The answer should be:

```json
{
    "version": "0.5.0"
}
```

-   Create a subscription to process _FIWARE Context Broker_ notifications when new data is available:

```bash
curl -X POST \
  'http://localhost:8668/v2/subscribe?orionUrl=http://orion:1026/v2&quantumleapUrl=http://quantumleap:8668/v2' \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: atosioe' \
  -H 'fiware-servicepath: /lorattn'
```

-   Check that the subscription has been created correctly:

```bash
curl -X GET \
  http://localhost:1026/v2/subscriptions \
  -H 'fiware-service: atosioe' \
  -H 'fiware-servicepath: /lorattn'
```

-   The result should be similar to:

```json
[
    {
        "id": "5c3cad5cc337e68131030f65",
        "description": "Created by QuantumLeap http://quantumleap:8668/v2.",
        "status": "active",
        "subject": {
            "entities": [
                {
                    "idPattern": ".*"
                }
            ],
            "condition": {
                "attrs": []
            }
        },
        "notification": {
            "timesSent": 1,
            "lastNotification": "2019-01-14T15:40:12.00Z",
            "attrs": [],
            "attrsFormat": "normalized",
            "http": {
                "url": "http://quantumleap:8668/v2/notify"
            },
            "metadata": ["dateCreated", "dateModified"],
            "lastSuccess": "2019-01-14T15:40:13.00Z"
        },
        "throttling": 1
    }
]
```

-   When new data is send by the LoRaWAN endnode, it should be also received by QuantumLeap. Execute:

```bash
curl -X GET \
  http://localhost:8668/v2/entities/LORA-DEVICE \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: atosioe' \
  -H 'fiware-servicepath: /lorattn'
```

-   The result should be similar to:

```json
{
    "data": {
        "attributes": [
            {
                "attrName": "TimeInstant",
                "values": ["2019-01-14T14:30:00.000", "2019-01-14T14:30:00.000", "2019-01-14T14:43:28.000"]
            },
            {
                "attrName": "temperature_1",
                "values": [27.2, 27.2, 27.2]
            }
        ],
        "entityId": "LORA-DEVICE",
        "index": ["2019-01-14T14:30:00.000", "2019-01-14T14:30:00.000", "2019-01-14T14:43:28.000"]
    }
}
```

### Data visualization using _Grafana_

-   Navigate to `http://localhost:3000` and get logged
    -   Default credentials are `admin/admin`

![Grafana login](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/grafana_login.png)

-   Create a new _CrateDB_ datasource in `http://localhost:3000/datasources` using the following parameters:
    -   Url: `http://crate:4200`
    -   Access: Server(Default)
    -   Schema: mtatosioe
    -   Table: etloradevice
    -   Check Query Source: checked
    -   Time column: time_index

![Grafana datasource](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/grafana_datasource.png)

-   From `http://localhost:3000/dashboards`, import the dashboard located at
    `examples/stm32_ttn_tutorial/grafana_dashboard.json`.

![Grafana import](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/grafana_import.png)

-   The following dashboard should be created showing the temperature reported by the LoRaWAN end-node.

![Grafana dashboard](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/docs/img/stm32_ttn_tutorial/grafana_dashboard.png)

## FAQ

### It is not possible to flash the device using Linux operating system with Oracle VirtualBox

`https://superuser.com/questions/683034/oracle-virtualbox-connecting-usb-device`

### Device data is not received in _The Things Network_

-   Check that `DevEui` and `AppKey` of the device as registered in `The Things Network` match the ones obtained ithough
    the serial port using `minicom`.
-   Check that the `LORAWAN_JOIN_EUI` field of `Commissioning.h` within
    `Projects/B-L072Z-LRWAN1/Applications/LoRa/End_Node/LoRaWAN/App/inc/` path matches the one provided in
    `The Things Network` for the `Application EUI`.
-   In SW4STM32, clean and build the project again. Flash the result in the device. Follow the instructions of
    [`Program the STM32 board section`](#program-the-stm32-board).

### Temperature value in the `FIWARE Context Broker` is zero

-   The end-node sends periodically the temperature data. In order to force it, reset the board using the button with
    the label `RESET`.
-   Follow the steps of the previous point.
