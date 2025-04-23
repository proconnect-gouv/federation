FROM node:22.13.0-bullseye-slim AS base

ARG APP
ARG INSTANCE

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY ./package.json ./yarn.lock ./

#

RUN --mount=type=cache,sharing=locked,target=/usr/local/share/.cache/yarn \
  yarn --immutable --ignore-engines

COPY ./global.d.ts ./tsconfig.json ./nest-cli.json ./
COPY ./libs ./libs
COPY ./apps/${APP}/ ./apps/${APP}/
COPY ./instances/${INSTANCE}/ ./instances/${INSTANCE}/
RUN yarn run build:${INSTANCE}

ENV NODE_ENV=production
ENV INSTANCE=${INSTANCE}

RUN mkdir -p /tmp/.pm2/logs

SHELL ["/bin/bash", "-c"]
CMD yarn run start:prod:${INSTANCE}