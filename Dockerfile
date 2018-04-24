FROM node:8.9.4-slim
RUN apt-get update
RUN apt-get install -y git
RUN npm install -g grunt-cli
COPY . /opt/iotagent-lora/
WORKDIR /opt/iotagent-lora
RUN npm install
ENTRYPOINT bin/iotagent-lora