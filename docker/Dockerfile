#
# Copyright 2019 Atos Spain S.A
#
# This file is part of iotagent-lora
#
# iotagent-lora is free software: you can redistribute it and/or
# modify it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the License,
# or (at your option) any later version.
#
# iotagent-lora is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public
# License along with iotagent-lora. If not, see http://www.gnu.org/licenses/.
#

ARG NODE_VERSION=8.16.1-slim
FROM node:${NODE_VERSION}
ARG GITHUB_ACCOUNT=Atos-Research-and-Innovation
ARG GITHUB_REPOSITORY=IoTagent-LoRaWAN
ARG DOWNLOAD=latest
ARG SOURCE_BRANCH=master

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Copying Build time arguments to environment variables so they are persisted at run time and can be
# inspected within a running container.
# see: https://vsupalov.com/docker-build-time-env-values/  for a deeper explanation.

ENV GITHUB_ACCOUNT=${GITHUB_ACCOUNT}
ENV GITHUB_REPOSITORY=${GITHUB_REPOSITORY}
ENV DOWNLOAD=${DOWNLOAD}
ARG NODE_VERSION

LABEL "maintainer"="FIWARE IoTAgent Team. Atos Spain S.A"
LABEL "org.opencontainers.image.authors"="iot_support@tid.es"
LABEL "org.opencontainers.image.documentation"="https://fiware-lorawan.rtfd.io/"
LABEL "org.opencontainers.image.vendor"="Atos Spain S.A"
LABEL "org.opencontainers.image.licenses"="AGPL-3.0-only"
LABEL "org.opencontainers.image.title"="IoT Agent for the LoRaWAN protocol"
LABEL "org.opencontainers.image.description"="The Internet of Things Agent for LoRaWAN protocol enables data and commands to be exchanged between IoT devices and the NGSI interface of a context broker using the LoRaWAN protocol."
LABEL "org.opencontainers.image.source"="https://github.com/${GITHUB_ACCOUNT}/${GITHUB_REPOSITORY}"
LABEL "org.nodejs.version"="${NODE_VERSION}"

# IMPORTANT: For production environments use Docker Secrets to protect values of the sensitive ENV
# variables defined below, by adding _FILE to the name of the relevant variable.
#
# - IOTA_AUTH_USER, IOTA_AUTH_PASSWORD - when using Keystone Security
# - IOTA_AUTH_CLIENT_ID, IOTA_AUTH_CLIENT_SECRET - when using OAuth2 Security

#
# The following RUN command retrieves the source code from GitHub.
#
# To obtain the latest stable release run this Docker file with the parameters
# --no-cache --build-arg DOWNLOAD=stable
# To obtain any speciifc version of a release run this Docker file with the parameters
# --no-cache --build-arg DOWNLOAD=1.7.0
#
# The default download is the latest tip of the master of the named repository on GitHub
#
# Alternatively for local development, just copy this Dockerfile into file the root of the repository and
# replace the whole RUN statement by the following COPY statement in your local source using :
#
# COPY . /opt/iotagent-lora/
#
# hadolint ignore=DL3008
RUN \
  # Ensure that unzip is installed prior to downloading
  apt-get install -y --no-install-recommends unzip && \
  if [ "${DOWNLOAD}" = "latest" ] ; \
  then \
    RELEASE="${SOURCE_BRANCH}"; \
    echo "INFO: Building Latest Development from ${SOURCE_BRANCH} branch."; \
  elif [ "${DOWNLOAD}" = "stable" ]; \
  then \
    RELEASE=$(curl -s https://api.github.com/repos/"${GITHUB_ACCOUNT}"/"${GITHUB_REPOSITORY}"/releases/latest | grep 'tag_name' | cut -d\" -f4); \
    echo "INFO: Building Latest Stable Release: ${RELEASE}"; \
  else \
    RELEASE="${DOWNLOAD}"; \
    echo "INFO: Building Release: ${RELEASE}"; \
  fi && \
  RELEASE_CONCAT=$(echo "${RELEASE}" | tr / -); \
  curl -s -L https://github.com/"${GITHUB_ACCOUNT}"/"${GITHUB_REPOSITORY}"/archive/"${RELEASE}".zip > source.zip && \
  unzip source.zip -x "*/test/**" "*/rpm/**" "*/ghpages/**" "*/docs/**" "*/.*" && \
  rm source.zip && \
  mv "${GITHUB_REPOSITORY}-${RELEASE_CONCAT}" /opt/iotaul && \
  # Remove unzip and clean apt cache
  apt-get clean && \
  apt-get remove -y unzip && \
  apt-get -y autoremove && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /opt/iotagent-lora

# hadolint ignore=DL3008
RUN \
	# Ensure that Git is installed prior to running npm install
	apt-get update && \
	apt-get install -y --no-install-recommends git  && \
	npm install pm2@3.2.2 -g && \
	echo "INFO: npm install --production..." && \
	npm install --production && \
	# Remove Git and clean apt cache
	apt-get clean && \
	apt-get remove -y git && \
	apt-get -y autoremove  && \
    rm -rf /var/lib/apt/lists/*  && \
	chmod +x docker/entrypoint.sh

USER node
ENV NODE_ENV=production

# Expose 4041 for NORTH PORT
EXPOSE ${IOTA_NORTH_PORT:-4041}

ENTRYPOINT ["docker/entrypoint.sh"]
CMD ["-- ", "config.js"]
