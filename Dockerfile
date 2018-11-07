ARG  NODE_VERSION=8.12.0-slim
FROM node:${NODE_VERSION}

MAINTAINER FIWARE IoTAgent Team. Atos Spain S.A

RUN apt-get update
RUN apt-get install -y git
npm install pm2@3.2.2 -g
COPY . /opt/iotagent-lora/
WORKDIR /opt/iotagent-lora
RUN npm install --production

RUN apt-get clean
RUN apt-get remove -y git
RUN apt-get -y autoremove

USER node
ENV NODE_ENV=production

ENTRYPOINT ["pm2-runtime", "bin/iotagent-lora]
CMD ["-- ", "config.js"]