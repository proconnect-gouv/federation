ARG NODE_VERSION=22.13.0
ARG NODE_IMAGE=node:${NODE_VERSION}-alpine

FROM ${NODE_IMAGE} AS dev

WORKDIR /var/www/app

COPY package*.json ./
RUN yarn install --ignore-engines 
COPY node_modules ./node_modules

COPY tsconfig*.json global.d.ts nest-cli.json webpack.config.js ./
COPY ./apps ./apps
COPY ./libs ./libs

ARG INSTANCE
COPY ./instances/${INSTANCE} ./instances/${INSTANCE}

FROM ${NODE_IMAGE} AS builder

ARG INSTANCE

COPY . /build/back

WORKDIR /build/back

RUN yarn install --ignore-engines

RUN yarn run build:${INSTANCE}

RUN rm -rf node_modules && yarn install --production --ignore-engines


FROM ${NODE_IMAGE} AS production

ARG INSTANCE

RUN npm install -g pm2

ENV NODE_ENV=production
ENV PM2_HOME=/tmp/.pm2


COPY deploy/pm2/app.json /etc/pm2/

VOLUME ["/data/log", "/etc/ssl/client_certs"]

COPY --from=builder /build/back/node_modules /var/www/app/node_modules
COPY --from=builder /build/back/dist/instances/${INSTANCE} /var/www/app/dist/instances/app

WORKDIR /var/www/app

CMD ["pm2-runtime", "/etc/pm2/app.json"]
