ARG NODE_VERSION=22.13.0

ARG BUILDER_NODE_IMAGE_VERSION=node:${NODE_VERSION}-alpine
ARG NODE_IMAGE_VERSION=node:${NODE_VERSION}-alpine


FROM ${BUILDER_NODE_IMAGE_VERSION} AS builder

ARG INSTANCE

WORKDIR /build

RUN ls -la /build

COPY ./back/package.json ./back/yarn.lock ./

RUN --mount=type=cache,sharing=locked,target=/usr/local/share/.cache/yarn \
    yarn --immutable --ignore-engines

COPY ./back/global.d.ts ./back/tsconfig.json ./back/nest-cli.json ./
COPY ./back/libs ./libs
COPY ./back/apps ./apps
COPY ./back/instances/${INSTANCE} ./instances/${INSTANCE}

RUN yarn run build:${INSTANCE}


FROM ${NODE_IMAGE_VERSION} AS production

ARG INSTANCE

ENV NODE_ENV=production
ENV INSTANCE=${INSTANCE}


WORKDIR /var/www/app

RUN mkdir -p /app/dist/instances

COPY --from=builder --chown=node:node /build/node_modules /var/www/app/node_modules
COPY --from=builder --chown=node:node /build/dist/instances/${INSTANCE} /var/www/app/dist/instances/app

RUN mkdir -p /data/log/app && chown node:node /data/log/app

RUN mkdir /etc/pm2
COPY ./deploy/pm2/app.json /etc/pm2/

RUN npm install -g pm2

USER node


CMD ["pm2-runtime", "/etc/pm2/app.json"]
