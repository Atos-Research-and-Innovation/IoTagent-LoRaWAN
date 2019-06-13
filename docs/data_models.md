# Data Models

Currently, the FIWARE LoRaWAN IoT agent implements the following data models:

-   [CayenneLpp](https://mydevices.com/cayenne/docs/lora/#lora-cayenne-low-power-payload)
-   [IETF CBOR](https://tools.ietf.org/html/rfc7049)
-   The payload is directly decoded by the LoRaWAN application server.

The data model must be indicated during the device or group provisioning by means of the _data_model_ field within
_lorawan_ field:

| Data model         | data_model payload value |
| ------------------ | ------------------------ |
| CayenneLpp         | cayennelpp               |
| IETF CBOR          | cbor                     |
| Application server | application_server       |

## CayenneLpp

If this CayenneLpp is used by LoRaWAN devices in order to encode the payload data, the attributes include in device or
group provisioning must match the _data channel_ and the _type_ used, following the pattern **{type}\_{data channel}**.
Regarding the _type_ the following convention is used:

| CayenneLpp type     | IoT Agent attribute | IoT Agent attribute example |
| ------------------- | ------------------- | --------------------------- |
| Digital input       | digital_in          | digital_in_0                |
| Digital output      | digital_out         | digital_out_5               |
| Analog input        | analog_in           | analog_in_2                 |
| Analog output       | analog_out          | analog_out_9                |
| Luminosity          | luminosity          | luminosity_4                |
| Presence            | presence            | presence_7                  |
| Temperature         | temperature         | temperature_0               |
| Relative humidity   | relative_humidity   | relative_humidity_1         |
| Accerelometer       | accelerometer       | accelerometer_2             |
| Barometric pressure | barometric_pressure | barometric_pressure_1       |
| Gyrometer           | gyrometer           | gyrometer_7                 |
| GPS                 | gps                 | gps_0                       |
