ARG NODE_VERSION=24.10.0
ARG NODE_IMAGE=node:${NODE_VERSION}-alpine

FROM ${NODE_IMAGE} AS dev_dependencies

WORKDIR /var/www/app

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache,id=back-yarn-cache,sharing=locked \
    --mount=type=tmpfs,target=/tmp \
    yarn install --ignore-engines --immutable

FROM ${NODE_IMAGE} AS dependencies

WORKDIR /var/www/app

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache,id=back-yarn-cache,sharing=locked \
    --mount=type=tmpfs,target=/tmp \
    yarn install --ignore-engines --immutable --production

FROM ${NODE_IMAGE} AS migrator

WORKDIR /var/www/app

COPY --from=dependencies /var/www/app/node_modules node_modules
COPY package.json yarn.lock ./
COPY migrate-mongo-config.js ./migrate-mongo-config.js
COPY migrations ./migrations

FROM ${NODE_IMAGE} AS dev

WORKDIR /var/www/app

RUN apk add --no-cache bash

COPY --from=dev_dependencies /var/www/app/node_modules node_modules
COPY . ./

CMD yarn start:dev ${NESTJS_INSTANCE}

FROM ${NODE_IMAGE} AS builder

ARG INSTANCE

COPY . /build/back

WORKDIR /build/back

COPY --from=dev_dependencies /var/www/app/node_modules node_modules

RUN yarn run build ${INSTANCE}

FROM ${NODE_IMAGE} AS production

ARG INSTANCE

RUN yarn global add pm2@6.0.8

ENV NODE_ENV=production
ENV PM2_HOME=/tmp/.pm2

COPY deploy/pm2/app.json /etc/pm2/

VOLUME ["/data/log", "/etc/ssl/client_certs"]

COPY --from=dependencies /var/www/app/node_modules /var/www/app/node_modules
COPY --from=builder /build/back/dist/apps/${INSTANCE} /var/www/app/dist/instances/app

WORKDIR /var/www/app

CMD ["pm2-runtime", "/etc/pm2/app.json"]
