## [1.2.5-next](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/compare/v1.2.4...master) (2022-06-30)

### Features

-   replace winston with default logging facility
    ([37aacdb](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/pull/150/commits/37aacdbfcd983b4f67b14e49d6d05e0cfb7badd1))
-   reconnect lost mqtt connection
    ([37aacdb](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/pull/150/commits/37aacdbfcd983b4f67b14e49d6d05e0cfb7badd1))
-   support ttn v3
    ([185fd9b](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/pull/147/commits/185fd9bf1aad26b3816d74a4d67b90e36530af83))
-   refactor chirpstack support
    ([a4c3aa6](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/commit/a4c3aa6)):
    -   change the provider id to support chirpstack
    -   rename files to refer to chirpstack
-   simplify set-up of local dev environment
    ([fd3fcae](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/commit/fd3fcae)): provide a docker
    compose and a docker build for developers
-   use node 12 ([c1aa136](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/commit/c1aa136)).

### Continuous Integration

-   CHANGELOG workflow: Adds a workflow to ensure that the CHANGELOG is updated with every PR
    ([f6744c8](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/pull/145/commits/f6744c85e777f7fa47c486bd56d32fa329f9ef88))

### Bug Fixes

-   update build badge
    #152:([22d0a70](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/pull/153/commits/22d0a706e8da4a1a46754fd8a0a599b7ed2c5c32))
-   propagate group configuration updates
    ([37aacdb](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/pull/150/commits/37aacdbfcd983b4f67b14e49d6d05e0cfb7badd1))
-   fix failing test due to PR #120
    ([b0cb421](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/commit/b0cb421))
-   loraserverioAppService.js : In the MQTT subscription, the text 'rx', which is obsolete for ChirpStack since version
    3.11.0 (11/18/2020), has been replaced by '/event/up', which is what ChirpStack is currently publishing. As a
    consequence, if (splittedMqttTopic.length !== 5) also had to be changed from 5 to 6, since otherwise it gives a 'Bad
    format for a LoRaServer.io topic'. Reference: https://www.chirpstack.io/application-server/integrations/mqtt/

### Documentation

-   Document docker images release procedure (#82).

## [1.2.4](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/compare/v1.2.3...v1.2.4) (2021-01-22)

## [1.2.3](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/compare/v1.2.2...v1.2.3) (2019-06-13)

### Bug Fixes

-   **loraserver.io #70:** MQTT topics updated to versions after v1
    ([6e40ec9](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/commit/6e40ec9)), closes
    [#70](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/issues/70)

## [1.2.2](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/compare/v1.2.1...v1.2.2) (2019-06-05)

### Bug Fixes

-   forces new release ([3fceee9](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/commit/3fceee9))

## [1.2.1](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/compare/v1.2.0...v1.2.1) (2019-05-08)

### Bug Fixes

-   **mqtt binding #65:** correct handling of reconnections
    ([#67](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/issues/67))
    ([0fa3165](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/commit/0fa3165)), closes
    [#65](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/issues/65)

# [1.2.0](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/compare/v1.1.0...v1.2.0) (2019-04-04)

### Features

-   **docker:** add docker secrets
    ([5743352](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/commit/5743352)), closes
    [#58](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/issues/58)

# 1.1.0 (2019-04-03)

### Features

-   allow using proprietary data models decoded by application server
    ([1e7bf37](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/commit/1e7bf37))
-   allow using proprietary data models decoded by application server
    ([#33](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/issues/33))
    ([07f76ab](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/commit/07f76ab))
-   device EUI is passed when using configuration provisioning
    ([#54](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/issues/54))
    ([c0109b0](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/commit/c0109b0))
-   updates north port for docker image
    ([2148f1d](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/commit/2148f1d))
