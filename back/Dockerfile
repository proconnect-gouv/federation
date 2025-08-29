ARG NODE_VERSION=22.13.0
ARG NODE_IMAGE=node:${NODE_VERSION}-alpine

FROM ${NODE_IMAGE} AS dev

RUN apk add --no-cache bash

WORKDIR /var/www/app

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache,id=back-yarn-cache,sharing=locked \
    --mount=type=tmpfs,target=/tmp \
    yarn install --ignore-engines

CMD yarn start:dev ${NESTJS_INSTANCE}


FROM ${NODE_IMAGE} AS builder

ARG INSTANCE

COPY . /build/back

WORKDIR /build/back

RUN yarn install --ignore-engines --immutable --immutable-cache --check-cache

RUN yarn run build:${INSTANCE}

RUN rm -rf node_modules && yarn install --ignore-engines --immutable --immutable-cache --check-cache --production


FROM ${NODE_IMAGE} AS production

ARG INSTANCE

RUN yarn global add pm2@6.0.8

ENV NODE_ENV=production
ENV PM2_HOME=/tmp/.pm2


COPY deploy/pm2/app.json /etc/pm2/

VOLUME ["/data/log", "/etc/ssl/client_certs"]

COPY --from=builder /build/back/node_modules /var/www/app/node_modules
COPY --from=builder /build/back/dist/apps/${INSTANCE} /var/www/app/dist/instances/app

WORKDIR /var/www/app

CMD ["pm2-runtime", "/etc/pm2/app.json"]
