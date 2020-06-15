# Installation & Administration Guide

-   [Installation](#installation)
-   [Configuration](#configuration)

## Installation

There are two ways of installing the JSON IoT Agent: using Git or Docker image.

### Using GIT

In order to install the LoRaWAN IoT Agent, just clone the project and install the dependencies:

#### Requirements

-   [Node.js](https://nodejs.org/en/)
-   [MongoDB](https://docs.mongodb.com/manual/installation/)
-   [FIWARE Orion Context Broker](https://github.com/telefonicaid/fiware-orion)

#### Cloning the GitHub repository

1.  Clone the repository with the following command:

```bash
git clone https://github.com/Atos-Research-and-Innovation/IoTagent-LoRaWAN.git
```

2.  Once the repository is cloned, you have to download the dependencies for the project, and let it ready to the
    execution. From the root folder of the project execute:

```bash
npm install
```

3.  Launch the IoT Agent with the default configuration

```bash
node bin/iotagent-lora
```

You can use a custom configuration file:

```bash
node bin/iotagent-lora custom_config.js
```

The bootstrap process should finish with:

```bash
info: Loading devices from registry
info: LoRaWAN IoT Agent started
```

4.  Check that the IoTA is running correctly:

```bash
curl -v http://localhost:4061/iot/about
```

The result must be similar to:

```json
{ "libVersion": "2.6.0-next", "port": 4061, "baseRoot": "/" }
```

### Using Docker

A ready to use Docker image is [provided](https://hub.docker.com/r/ioeari/iotagent-lora/)

```bash
docker run -p 4061:4061 ioeari/iotagent-lora
```

#### Using Docker-compose

This project contains an example to deploy the IoTA and all the requirement using docker-compose.

```bash
docker-compose -f docker/docker-compose.yml up
```

## Configuration

#### Overview

All the configuration for the IoT Agent is stored in a single configuration file (typically installed in the root
folder). Please refer to the `Static configuration`section of [user guide](users_manual.md) for further information.

#### Configuration with environment variables

Some of the more common variables can be configured using environment variables. The ones overriding general parameters
in the `config.iota` set are described in the
[IoTA Library Configuration manual](https://github.com/telefonicaid/iotagent-node-lib#configuration).

#### High performance configuration

Node.js is single‑threaded and uses non-blocking I/O, allowing it to scale up to tens of thousands of concurrent
operations. Nevertheless, Node.js has a few weak points and vulnerabilities that can make Node.js‑based systems to offer
under-performance behaviour, specially when a Node.js web application experiences rapid traffic growth.

Additionally, It is important to know the place in which the node.js server is running, because it has limitations.
There are two types of limits on the host: hardware and software. Hardware limits can be easy to spot. Your application
might be consuming all of the memory and needing to consume disk to continue working. Adding more memory by upgrading
your host, whether physical or virtual, seems to be the right choice.

Moreover, Node.js applications have also a software memory limit (imposed by V8), therefore we cannot forget about these
limitations when we execute a service. In this case of 64-bit environment, your application would be running by default
at a 1 GB V8 limit. If your application is running in high traffic scenarios, you will need a higher limit. The same is
applied to other parameters.

It means that we need to make some changes in the execution of node.js and in the configuration of the system:

-   **Node.js flags**

    -   **--use-idle-notification**

        Turns of the use idle notification to reduce memory footprint.

    -   **--expose-gc**

        Use the expose-gc command to enable manual control of the garbage collector from the own node.js server code. In
        case of the IoTAgent, it is not implemented because it is needed to implement the calls to the garbage collector
        inside the ser server, nevertheless the recommended value is every 30 seconds.

    -   **--max-old-space-size=xxxx**

        In that case, we want to increase the limit for heap memory of each V8 node process in order to use max capacity
        that it is possible instead of the 1,4Gb default on 64-bit machines (512Mb on a 32-bit machine). The
        recommendation is at least to use half of the total memory of the physical or virtual instance.

-   **User software limits**

    Linux kernel provides some configuration about system related limits and maximums. In a distributed environment with
    multiple users, usually you need to take into control the resources that are available for each of the users.
    Nevertheless, when the case is that you have only one available user but this one request a lot of resources due to
    a high performance application the default limits are not proper configured and need to be changed to resolve the
    high performance requirements. These are like maximum file handler count, maximum file locks, maximum process count
    etc.

    You can see the limits of your system executing the command:

    ```bash
    ulimit -a
    ```

    You can detine the corresponding limits inside the file limits.conf. This description of the configuration file
    syntax applies to the `/etc/security/limits.conf` file and \*.conf files in the `/etc/security/limits.d` directory.
    You can get more information about the limits.conf in the
    [limits.con - linux man pages](http://man7.org/linux/man-pages/man5/limits.conf.5.html). The recommended values to
    be changes are the following:

    -   **core**

        Limits of the core file size in KB, we recommend to change to `unlimited` both hard and soft types.

            * soft core unlimited
            * hard core unlimited

    -   **data**

        Maximum data size in KB, we recommend to change to `unlimited` both hard and soft types.

            * soft data unlimited
            * hard data unlimited

    -   **fsize**

        Maximum filesize in KB, we recommend to change to `unlimited` both hard and soft types.

            * soft fsize unlimited
            * hard fsize unlimited

    -   **memlock**

        Maximum locked-in-memory address space in KB, we recommend to change to `unlimited` both hard and soft types.

            * memlock unlimited
            * memlock unlimited

    -   **nofile**

        Maximum number of open file descriptors, we recommend to change to `65535` both hard and soft types.

            * soft nofile 65535
            * hard nofile 65535

    -   **rss**

        Maximum resident set size in KB (ignored in Linux 2.4.30 and higher), we recommend to change to `unlimited` both
        hard and soft types.

            * soft rss unlimited
            * hard rss unlimited

    -   **stack**

        Maximum stack size in KB, we recommend to change to `unlimited` both hard and soft types.

            * soft stack unlimited
            * hard stack unlimited

    -   **nproc**

        Maximum number of processes, we recommend to change to `unlimited` both hard and soft types.

            * soft nproc unlimited
            * hard nproc unlimited

    You can take a look to the [limits.conf](limits.conf) file provided in this folder with all the values provided.

-   **Configure kernel parameters**

    sysctl is used to modify kernel parameters at runtime. We plan to modify the corresponding `/etc/sysctl.conf` file.
    You can get more information in the corresponding man pages of
    [sysctl](http://man7.org/linux/man-pages/man8/sysctl.8.html) and
    [sysctl.conf](http://man7.org/linux/man-pages/man5/sysctl.conf.5.html). You can search all the kernel parameters by
    using the command `sysctl -a`

    -   **fs.file-max**

        The maximum file handles that can be allocated, the recommended value is `1000000`.

            fs.file-max = 1000000

    -   **fs.nr_open**

        Max amount of file handles that can be opened, the recommended value is `1000000`.

            fs.nr_open = 1000000

    -   **net.netfilter.nf_conntrack_max**

        Size of connection tracking table. Default value is nf_conntrack_buckets value \* 4.

            net.nf_conntrack_max = 1048576

    For more details about any other kernel parameters, take a look to the example [sysctl.conf](sysctl.conf) file.
