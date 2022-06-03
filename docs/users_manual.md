# Supported LoRaWAN stacks/technologies

## The Things Network (TTN)

1.  Register your LoRaWAN gateways following `https://www.thethingsnetwork.org/docs/gateways/registration.html`.
1.  Create one or several applications following `https://www.thethingsnetwork.org/docs/applications/add.html`.
1.  Register your LoRaWAN devices within your applications following
    `https://www.thethingsnetwork.org/docs/devices/registration.html`.
1.  In order to use FIWARE IoT Agent for LoRaWAN protocol, you will need the following information:

    -   Application ID (step 2)
    -   Application key (step 2)
    -   Device EUI (step 3)
    -   App EUI (step 3)
    -   Application server information
        -   Host (step 3)
        -   Username: It is the Application ID.
        -   Password (step 3)

## ChirpStack.io

1.  Install/deploy LoRa Server project. Docker installation method is recommended:
    `https://www.chirpstack.io/install/docker/`
1.  Follow the [Getting started](https://www.chirpstack.io/use/getting-started/) page to register your network-server
    and to create a service-profile, gateway, device-profile, application. Finally, add your LoRaWAN devices. Register
    your network-server: `https://www.chirpstack.io/lora-app-server/use/network-servers/`
1.  In order to use FIWARE IoT Agent for LoRaWAN protocol, you will need the following information:

    -   Application ID
    -   Application key
    -   Device EUI
    -   App EUI
    -   Application server information
        -   Host where MQTT broker is running.
        -   Username if it is defined.
        -   Password if it is defined.

# API Walkthrough

This section of the _Users Manual_ provides examples of how to use the IoTA API to provision LoRaWAN devices using three
different mechanisms.

All of them use a relatively simple device or node reporting the following measurements or observations:

-   The barometric pressure
-   The relative humidity
-   The temperature
-   A generic digital input
-   A generic digital output

The example below uses TTN (as you can see in the `provider` configuration), to use chirpstack you should pass
`chirpstack` (or `loraserver.io` for backward compatibility) in the `provider` attribute.

## Device provisioning

This option allows provisioning a specific device, describing its attributes and LoRaWAN information. **Thus, using a
single Application Server, we can provision devices reporting different types of measurements.**

```bash
curl localhost:4061/iot/devices -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'fiware-service: smartgondor' --header 'fiware-servicepath: /gardens' -d @- <<EOF
{
  "devices": [
    {
      "device_id": "lora_n_003",
      "entity_name": "LORA-N-003",
      "entity_type": "LoraDevice",
      "timezone": "America/Santiago",
      "attributes": [
        {
          "object_id": "bp0",
          "name": "barometric_pressure_0",
          "type": "hpa"
        },
        {
          "object_id": "di3",
          "name": "digital_in_3",
          "type": "Number"
        },
        {
          "object_id": "do4",
          "name": "digital_out_4",
          "type": "Number"
        },
        {
          "object_id": "rh2",
          "name": "relative_humidity_2",
          "type": "Number"
        },
        {
          "object_id": "t1",
          "name": "temperature_1",
          "type": "Number"
        }
      ],
      "internal_attributes": {
        "lorawan": {
          "application_server": {
            "host": "eu.thethings.network",",
            "username": "ari_ioe_app_demo1",
            "password": "pwd1",
            "provider": "TTN"
          },
          "dev_eui": "1119343755556A14",
          "app_eui": "4569343567897875",
          "application_id": "ari_ioe_app_demo1",
          "application_key": "444B8EF16415B5F6ED777EAFE695C49",
          "data_model": "cayennelpp"
        }
      }
    }
  ]
}
EOF
```

-   provider: Identifies the LoRaWAN stack. **Current possible value is TTN.**
-   data_model: Identifies the data model used by the device to report new observations. **Current possible values are
    cayennelpp,cbor and application_server. The last one can be used in case the payload format decoding is done by the
    application server. See [data models](./data_models.md) for further information.**

The IoTa will automatically subscribe to new observation notifications from the device. Whenever a new update is
received, it will be translated to NGSI and forwarded to the Orion Context Broker.

You can query the corresponding entity in the Context Broker with:

```bash
curl localhost:1026/v2/entities/LORA-N-003 -s -S -H 'Accept: application/json' --header 'fiware-service: smartgondor' --header 'fiware-servicepath: /gardens' | python -mjson.tool
```

## Configuration provisioning

If a group of devices reports the same observations (i.e., smart meters for a neighborhood or building), the
_configuration API_ can be used to pre-provision all of them with a single request.**With this approach, all the devices
sharing the same configuration must be registered under the same Application Server.**

```bash
curl localhost:4061/iot/services -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'fiware-service: smartgondor' --header 'fiware-servicepath: /gardens' -d @- <<EOF
{
	"services": [
   {
    "entity_type": "LoraDeviceGroup",
    "apikey": "",
    "resource": "4569343567897875",
    "attributes": [
      {
        "object_id": "bp0",
        "name": "barometric_pressure_0",
        "type": "Number"
      },
      {
        "object_id": "di3",
        "name": "digital_in_3",
        "type": "Number"
      },
      {
        "object_id": "do4",
        "name": "digital_out_4",
        "type": "Number"
      },
      {
        "object_id": "rh2",
        "name": "relative_humidity_2",
        "type": "Number"
      },
      {
        "object_id": "t1",
        "name": "temperature_1",
        "type": "Number"
      }
    ],
    "internal_attributes": {
        "lorawan": {
          "application_server": {
            "host": "eu.thethings.network",",
            "username": "ari_ioe_app_demo1",
            "password": "pwd1",
            "provider": "TTN"
          },
          "app_eui": "4569343567897875",
          "application_id": "ari_ioe_app_demo1",
          "application_key": "444B8EF16415B5F6ED777EAFE695C49",
          "data_model": "cayennelpp"
    }
  }
]
}
EOF
```

As it can be seen, the **resource** property of the payload must match the App EUI.

In this case, the IoTA will subscribe to any observation coming from the LoRaWAN application server. Whenever a new
update arrives, it will create the corresponding device internally and also in the Context Broker using the
pre-provisioned configuration. Finally, it will forward appropriate context update requests to the Context Broker to
update the attributes' values.

## Static configuration

Finally, it is also possible to provide a static configuration for the IoTa. As it happens with the previous
alternative, this approach is useful for groups of devices which report the same observations. Again, **all the devices
sharing the same _Type_ must be registered under the same Application Server.**

```javascript
var config = {};

config.iota = {
    timestamp: false,
    logLevel: "DEBUG",
    contextBroker: {
        host: "localhost",
        port: "1026",
        ngsiVersion: "v2"
    },
    server: {
        port: 4041
    },
    service: "howtoService",
    subservice: "/howto",
    providerUrl: "http://localhost:4061",
    deviceRegistrationDuration: "P1M",
    defaultType: "Thing",
    defaultResource: "/iot/d",
    deviceRegistry: {
        type: "mongodb"
    },
    mongodb: {
        host: "localhost",
        port: "27017",
        db: "iotagentLoraTest"
    },
    types: {
        Mote: {
            service: "factory",
            subservice: "/robots",
            attributes: [
                {
                    object_id: "bp0",
                    name: "barometric_pressure_0",
                    type: "hpa"
                },
                {
                    object_id: "di3",
                    name: "digital_in_3",
                    type: "Number"
                },
                {
                    object_id: "do4",
                    name: "digital_out_4",
                    type: "Number"
                },
                {
                    object_id: "rh2",
                    name: "relative_humidity_2",
                    type: "Number"
                },
                {
                    object_id: "t1",
                    name: "temperature_1",
                    type: "Number"
                }
            ]
        }
    }
};

module.exports = config;
```

## Testing the LoRaWAN IoT Agent with dummy devices

This section of the _Users Manual_ provides guidance on deploy a dummy device and testing it without having a real
account on TTN.

Such testing can be very useful especially to people looking in testing the code and contributing to it.

As a matter of fact, the LoRaWAN IoT Agent leverages the MTTQ services provided by TTN or ChirpStack to retrieve data
from the sensors and pushing them to the Context Broker. Essentially this means, that using a simple MTTQ broker and a
MQTT client you can actually simulate the connection of the LoRaWAN IoT Agent to TTN or ChirpStack.

We will proceed as follow:

1.  We will deploy a stack including the relevant services to test the end-to-end functionality of the LoRaWAN IoT Agent
1.  We will register 1 device group simulating a TTN device.
1.  We will send messages to the MQTT broker simulating the device sending data.
1.  We will verify that the data have been correctly decoded and forwarded to the Context Broker.

You will find the scripts related to this walkthrough in the
[examples/dummy-devices](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/tree/master/examples/dummy-devices)
folder.

### Deploy the testing IoT stack and registering a device group

To run this walkthrough you need to deploy:

-   IoT LoRaWAN IoT Agent
-   Mosquito MQTT
-   Orion Context Broker

From the
[examples/dummy-devices](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/tree/master/examples/dummy-devices)
folder, run the following command:

```bash
bash start.sh
```

This command will start the IoT stack, and register a dummy service representing weather observation devices:

```json
{
    "services": [
        {
            "entity_type": "WeatherObserved",
            "apikey": "",
            "resource": "70B3D57ED00006B2",
            "attributes": [
                {
                    "object_id": "temperature_1",
                    "name": "temperature",
                    "type": "Number"
                },
                {
                    "object_id": "barometric_pressure_0",
                    "name": "pressure",
                    "type": "Number"
                },
                {
                    "object_id": "relative_humidity_2",
                    "name": "relative_humidity",
                    "type": "Number"
                }
            ],
            "internal_attributes": {
                "lorawan": {
                    "application_server": {
                        "host": "mqtt",
                        "username": "admin",
                        "password": "password",
                        "provider": "TTN"
                    },
                    "app_eui": "70B3D57ED00006B2",
                    "application_id": "demoTTN",
                    "application_key": "BE6996EEE2B2D6AFFD951383C1F3C3BD",
                    "data_model": "cayennelpp"
                }
            }
        }
    ]
}
```

### Send a message to the MQTT and verify that the value is passed to orion

From the
[examples/dummy-devices](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/tree/master/examples/dummy-devices)
folder, run the following command:

```bash
bash test-data.sh
```

This script will send a JSON message to the mqtt broker as defined by TTN api, e.g.:

```json
{
  "app_id": "demoTTN",
  "dev_id": "myDevice",
  "hardware_serial": "0102030405060708",
  "port": 1,
  "counter": 2,
  "is_retry": false,
  "confirmed": false,
  "payload_raw": "AHMnSwFnARYCaFADAGQEAQAFAdc=",
  ...
}
```

The `payload_raw` field contains a base64 encoded version of the binary encoding of the CayenneLPP payload.

The topic used by TTN v2 API has the following format: `{application_id}/devices/{device_id}/up`.

Using the service group defined above, the CayenneLPP payload will be decoded and mapped to the NGSI format, the
resulting NGSI entity should be something like:

```json
{
    "id": "myDevice:WeatherObserved",
    "type": "WeatherObserved",
    "TimeInstant": {
        "type": "DateTime",
        "value": "2022-03-18T00:42:03.924Z",
        "metadata": {}
    },
    "pressure": {
        "type": "Number",
        "value": 1005.9,
        "metadata": {
            "TimeInstant": {
                "type": "DateTime",
                "value": "2022-03-18T00:42:03.924Z"
            }
        }
    },
    "relative_humidity": {
        "type": "Number",
        "value": 40,
        "metadata": {
            "TimeInstant": {
                "type": "DateTime",
                "value": "2022-03-18T00:42:03.924Z"
            }
        }
    },
    "temperature": {
        "type": "Number",
        "value": 27.8,
        "metadata": {
            "TimeInstant": {
                "type": "DateTime",
                "value": "2022-03-18T00:42:03.924Z"
            }
        }
    }
}
```

### Removing your stacks

From the
[examples/dummy-devices](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/tree/master/examples/dummy-devices)
folder, run the following command:

```bash
bash stop.sh
```
