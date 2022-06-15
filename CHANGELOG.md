## [1.2.5](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/compare/v1.2.4...1.2.5) (2022-06-15)

### Features

-   update default config.js (#132)
-   use specific version of iot agent node lib: 2.21.0 (#132)
-   support configuration of custom JEXL transformations (#133)
-   replace winston with default logging facility (#150)
-   reconnect lost mqtt connection (#134)
-   support ttn v3 (#111)
-   support mqtts and other fine grained mqtt application server configuration (#146)
-   refactor chirpstack support (#144)
-   simplify set-up of local dev environment (#144)
-   use node 12 (#121).

### Continuous Integration

-   adds a workflow to ensure that the CHANGELOG is updated with every PR (#145)
-   new docker build workflow (#124)
-   add document and code linting workflow (#123)
-   add cla signature workflow (#122)

### Bug Fixes

-   follow NGSI-LD naming schema for self provisioning (#138)
-   update build badge (#152)
-   propagate group configuration updates (#134)
-   fix failing test due to PR #120 (#143)
-   lint and prettify code (#142)
-   lint documents (#141)
-   loraserverioAppService.js (#120)

### Documentation

-   document docker images release procedure (#82).
-   document how to simulate ttn device (#108).

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
