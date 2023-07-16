##!/usr/bin/env bash

curl --location --request DELETE 'localhost:4041/iot/services?resource=70B3D57ED00006B2&apikey=' \
--header 'fiware-service: smartgondor' \
--header 'fiware-servicepath: /environment'


curl --location --request DELETE 'localhost:4041/iot/devices/myDevice' \
--header 'fiware-service: smartgondor' \
--header 'fiware-servicepath: /environment'

#docker compose down -v
docker-compose down -v
