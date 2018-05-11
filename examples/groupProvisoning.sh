curl -s -S --header 'Content-Type: application/json' \
  --header 'Accept: application/json' --header 'fiware-service: weather' --header 'fiware-servicepath: /baloons' -d '{
  "services": [
    {
      "resource": "/ttn",
      "apikey": "",
      "type": "atos_ioe_lora_ttn",
	    "cbHost": "http://localhost:1026",
      "commands": [],
      "lazy": [],
      "attributes": [
        {
          "name": "barometric_pressure_0",
          "type": "hpa"
        },
        {
          "name": "digital_in_3",
          "type": "Integer"
        },
        {
          "name": "digital_out_4",
          "type": "Integer"
        },  
        {
          "name": "relative_humidity_2",
          "type": "rh"
        }, 
        {
          "name": "temperature_1",
          "type": "celsius"
        }
      ],
      "internal_attributes": {
        "lorawan": {
          "region": "eu",
          "appId": "ari_ioe_app_demo1",
          "accessKey": "ttn-account-v2.UitfM5cPazqW52_zbtgUS6wM5vp1MeLC9Yu-Cozjfp0"    
        }
      }
    }
  ]
}

' 'http://localhost:4061/iot/services'