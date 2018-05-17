# Contributions

Please check [contribution guidelines](https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN/blob/master/CONTRIBUTING.md).

# Testing

This project contains a set of tests that can be run to automatically verify the correctness of the IoTA functionalities.

The following requirements must be installed and executed in order to launch the tests:

- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://docs.mongodb.com/manual/installation/)
- [FIWARE Orion Context Broker](https://github.com/telefonicaid/fiware-orion)
- [Mosquitto Broker](https://mosquitto.org/download/)

To run the tests:

```
grunt test
```

# Code coverage

In addition, the project is configured to provide source code coverage statistics reached thanks to the tests.

```
grunt coverage
```

This command will produce an HTML coverage report under *coverage* folder.

# Coding guidelines

[ESLint](https://eslint.org/) is used to check code linting:

```
grunt lint
```