ARG NODE_VERSION=22.13.0
ARG NODE_IMAGE=node:${NODE_VERSION}-alpine

FROM ${NODE_IMAGE} AS builder

COPY . /tmp/src

RUN apk add python3 make g++ lscpu

WORKDIR /tmp/src
RUN yarn install

## build shared
WORKDIR /tmp/src/shared
RUN yarn run build --outDir /federation-admin/shared

## build fc-exploitation
WORKDIR /tmp/src/fc-exploitation
RUN yarn run build

WORKDIR /federation-admin/shared
RUN mv /tmp/src/shared/package.json ./ && \
    mv /tmp/src/shared/views ./ && \
    mv /tmp/src/shared/user/emails ./user/

WORKDIR /federation-admin/fc-exploitation
RUN mv /tmp/src/fc-exploitation/package.json ./ && \
    mv /tmp/src/fc-exploitation/dist ./ && \
    mv /tmp/src/fc-exploitation/views ./

WORKDIR /federation-admin
RUN mv /tmp/src/yarn.lock ./ && \
    mv /tmp/src/package.json ./ && \
    yarn install --production && \
    rm -f package.json */package.json yarn.lock

RUN mkdir /etc/pm2
COPY deploy/pm2/app.json /etc/pm2/

FROM ${NODE_IMAGE} AS production

RUN npm install -g pm2

ENV PM2_HOME=/tmp/.pm2
ENV NODE_ENV=production

COPY --from=builder /federation-admin /var/www/app
COPY --from=builder /etc/pm2 /etc/pm2

WORKDIR /var/www/app

CMD ["pm2-runtime", "/etc/pm2/app.json"]
