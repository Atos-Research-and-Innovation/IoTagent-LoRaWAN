##!/usr/bin/env bash

#start stack
#docker compose up -d
docker-compose up -d

# wait service to be up
wait=0
HOST="http://localhost:4041/iot/about"
while [ "$(curl -s -o /dev/null -L -w ''%{http_code}'' $HOST)" != "200" ] && [ $wait -le 60 ]
do
  echo "Waiting for IoT Agent..."
  sleep 5
  wait=$((wait+5))
  echo "Elapsed time: $wait"
done

echo 'registering device group'

curl --location --request POST 'localhost:4041/iot/services' \
--header 'fiware-service: smartgondor' \
--header 'fiware-servicePath: /environment' \
--header 'Content-Type: application/json' \
--data-raw '{
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
}'
