FROM node:24.19.0-alpine AS dev_dependencies

WORKDIR /var/www/app

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache,id=back-yarn-cache,sharing=locked \
    --mount=type=tmpfs,target=/tmp \
    yarn install --ignore-engines --immutable

FROM node:24.19.0-alpine AS dependencies

WORKDIR /var/www/app

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache,id=back-yarn-cache,sharing=locked \
    --mount=type=tmpfs,target=/tmp \
    yarn install --ignore-engines --immutable --production

FROM node:24.19.0-alpine AS dev

WORKDIR /var/www/app

RUN apk add --no-cache bash

COPY --from=dev_dependencies /var/www/app/node_modules node_modules
COPY package.json nest-cli.json tsconfig.json tsconfig.build.json global.d.ts migrate-mongo-config.js ./
COPY apps ./apps
COPY libs ./libs
COPY migrations ./migrations
COPY scripts/seed ./scripts/seed

CMD yarn start:dev core-fca-low

FROM dev_dependencies AS builder

COPY nest-cli.json tsconfig.json tsconfig.build.json global.d.ts ./
COPY apps ./apps
COPY libs ./libs

RUN yarn run build

FROM node:24.19.0-alpine AS production

ENV NODE_ENV=production

VOLUME ["/etc/ssl/client_certs"]

WORKDIR /var/www/app

COPY --from=dependencies /var/www/app/node_modules node_modules
COPY --from=builder /var/www/app/dist/apps/core-fca-low dist/instances/app
COPY package.json ./
COPY migrate-mongo-config.js ./migrate-mongo-config.js
COPY migrations ./migrations

CMD ["node", "dist/instances/app/main.js"]
