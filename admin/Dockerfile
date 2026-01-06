ARG NODE_VERSION=24.11.0
ARG NODE_IMAGE=node:${NODE_VERSION}-alpine

# -- dev_dependencies
FROM ${NODE_IMAGE} AS dev_dependencies

RUN apk add --no-cache bash python3 make g++ lscpu

WORKDIR /var/www/app

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache,id=admin-yarn-cache,sharing=locked \
    --mount=type=tmpfs,target=/tmp \
    yarn install --ignore-engines

COPY . ./

# -- postgres-migrator
FROM dev_dependencies AS postgres-migrator
CMD ["yarn", "migrations:run"]

# -- dev
FROM dev_dependencies AS dev
CMD ["yarn", "start:dev"]

# -- builder
FROM ${NODE_IMAGE} AS builder

COPY . /tmp/admin

RUN apk add --no-cache python3 make g++ lscpu

WORKDIR /tmp/admin
RUN yarn install --ignore-engines --immutable --immutable-cache --check-cache

WORKDIR /tmp/admin
RUN yarn run build

WORKDIR /federation-admin
RUN mv /tmp/admin/package.json ./ && \
    mv /tmp/admin/dist ./ && \
    mv /tmp/admin/views ./

RUN mv /tmp/admin/yarn.lock ./ && \
    yarn install --ignore-engines --immutable --immutable-cache --check-cache --production && \
    rm -f package.json */package.json yarn.lock

RUN mkdir /etc/pm2
COPY deploy/pm2/app.json /etc/pm2/

# -- production
FROM ${NODE_IMAGE} AS production

RUN yarn global add pm2@6.0.8

ENV PM2_HOME=/tmp/.pm2
ENV NODE_ENV=production

COPY --from=builder /federation-admin /var/www/app
COPY --from=builder /etc/pm2 /etc/pm2

WORKDIR /var/www/app

CMD ["pm2-runtime", "/etc/pm2/app.json"]
