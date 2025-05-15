# the different stages of this Dockerfile are meant to be built into separate images
# https://docs.docker.com/compose/compose-file/#target

ARG NODE_VERSION=22.13.0
ARG DEBIAN_VERSION=bullseye

FROM node:${NODE_VERSION#v}-${DEBIAN_VERSION}-slim AS prod

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y curl gnupg

RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /usr/share/keyrings/yarnkey.gpg >/dev/null && \
    echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt update && \
    apt install -y python3 \
                   python3-pip \
                   yarn \
                   git \
                   procps \
    && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/python3 /usr/bin/python

RUN npm install -g npm && \
    npm set progress=false && \
    npm install -g pm2 && \
    echo "alias ll=\"ls -lahF --color\"" >> ~/.bashrc

RUN mkdir -p /var/www

FROM prod AS dev

RUN yarn global add node-gyp

RUN apt update && \
    apt install -y build-essential \
                   jq \
                   openssl \
                   python \
                   wget \
                   bc \
    && rm -rf /var/lib/apt/lists/*
