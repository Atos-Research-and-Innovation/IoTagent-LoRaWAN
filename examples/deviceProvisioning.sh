curl -s -S --header 'Content-Type: application/json' \
  --header 'Accept: application/json' --header 'fiware-service: atosioe' --header 'fiware-servicepath: /lorattn' -d '

{
  "devices": [
    {
      "protocol": "GENERIC_PROTO",
      "device_id": "lora_n_005",
      "entity_name": "LORA-N-005",
      "entity_type": "LoraDevice",
      "timezone": "America/Santiago",
      "attributes": [
        {
          "name": "barometric_pressure_0",
          "type": "Float"
        },
        {
          "name": "digital_in_3",
          "type": "Float"
        },
        {
          "name": "digital_out_4",
          "type": "Float"
        },  
        {
          "name": "relative_humidity_2",
          "type": "Float"
        }, 
        {
          "name": "temperature_1",
          "type": "Float"
        }       
      ],
      "internal_attributes": {
        "lorawan": {
          "application_server": {
            "host": "eu.thethings.network",
            "username": "ari_ioe_app_demo1",
            "password": "ttn-account-v2.UitfM5cPazqW52_zbtgUS6wM5vp1MeLC9Yu-Cozjfp0",
            "provider": "TTN"
          },
          "dev_eui": "3331383274356D05",
          "app_eui": "70B3D57ED000985F",
          "application_id": "ari_ioe_app_demo1",
          "application_key": "9BE6B8EF16415B5F6ED4FBEAFE695C49"
        }
      }
    }
  ]
}


' 'http://130.206.112.170:4061/iot/devices'