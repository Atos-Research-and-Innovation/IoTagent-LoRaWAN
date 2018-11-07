ARG NODE_VERSION=8.12.0-slim
FROM node:${NODE_VERSION}

MAINTAINER FIWARE IoTAgent Team. Atos Spain S.A

COPY . /opt/iotagent-lora/
WORKDIR /opt/iotagent-lora

RUN \
	apt-get update && \
	apt-get install -y git  && \
	npm install pm2@3.2.2 -g && \
	echo "INFO: npm install --production..." && \
	cd /opt/iotagent-lora && npm install --production && \
	# Clean apt cache
	apt-get clean && \
	apt-get remove -y git && \
	apt-get -y autoremove

USER node
ENV NODE_ENV=production

ENTRYPOINT ["pm2-runtime", "bin/iotagent-lora"]
CMD ["-- ", "config.js"]
