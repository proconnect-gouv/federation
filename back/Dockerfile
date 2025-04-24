ARG BUILDER_NODE_IMAGE_VERSION=node:lts-alpine
ARG NODE_IMAGE_VERSION=node:lts-alpine


FROM ${BUILDER_NODE_IMAGE_VERSION} AS builder

ARG INSTANCE

WORKDIR /build

COPY ./package.json ./yarn.lock ./

RUN --mount=type=cache,sharing=locked,target=/usr/local/share/.cache/yarn \
    yarn --immutable --ignore-engines

COPY ./global.d.ts ./tsconfig.json ./nest-cli.json ./
COPY ./libs ./libs
COPY ./apps ./apps
COPY ./instances/${INSTANCE} ./instances/${INSTANCE}

RUN yarn run build:${INSTANCE}


FROM ${NODE_IMAGE_VERSION} AS production

ARG INSTANCE

ENV NODE_ENV=production
ENV INSTANCE=${INSTANCE}


WORKDIR /app

RUN mkdir -p /app/dist/instances

COPY --from=builder --chown=node:node /build/node_modules /app/node_modules
COPY --from=builder --chown=node:node /build/dist/instances/${INSTANCE} /app/dist/instances/app

USER node

CMD ["node", "/app/dist/instances/app/main.js"]


# Emulation du fonctionnement de PM2 concernant les logs

USER root

ENV EMULATE_PM2=0

RUN mkdir -p /data/log/app && chown node:node /data/log/app

COPY --chown=node:node ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER node

ENTRYPOINT ["/entrypoint.sh"]
