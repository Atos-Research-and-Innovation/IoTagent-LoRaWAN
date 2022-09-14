#!/usr/bin/env bash

echo 'retrieve service group'

curl --location --request GET 'localhost:4041/iot/services?resource=70B3D57ED00006B2&apikey=' \
--header 'fiware-service: smartgondor' \
--header 'fiware-servicepath: /environment' | jq

echo 'retrieve device'

curl --location --request GET 'localhost:4041/iot/devices/myDevice' \
--header 'fiware-service: smartgondor' \
--header 'fiware-servicepath: /environment' | jq