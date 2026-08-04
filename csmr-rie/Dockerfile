
FROM node:26.5.1-alpine AS dev_dependencies
WORKDIR /var/www/app/csmr-rie
COPY csmr-rie/package.json csmr-rie/yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache,id=csmr-rie-yarn-cache,sharing=locked \
    --mount=type=tmpfs,target=/tmp \
    yarn install --immutable

FROM node:26.5.1-alpine AS dependencies
WORKDIR /var/www/app/csmr-rie
COPY csmr-rie/package.json csmr-rie/yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache,id=csmr-rie-yarn-cache,sharing=locked \
    --mount=type=tmpfs,target=/tmp \
    yarn install --immutable --production

FROM node:26.5.1-alpine AS dev
WORKDIR /var/www/app/csmr-rie
COPY --from=dev_dependencies /var/www/app/csmr-rie/node_modules node_modules
COPY csmr-rie/package.json csmr-rie/nest-cli.json csmr-rie/tsconfig.json csmr-rie/tsconfig.app.json ./
COPY csmr-rie/src/ ./src
COPY back/libs /var/www/app/back/libs
CMD ["yarn", "start:dev"]

FROM dev_dependencies AS builder
COPY csmr-rie/tsconfig.json csmr-rie/tsconfig.app.json csmr-rie/nest-cli.json ./
COPY csmr-rie/src/ ./src
COPY back/libs /var/www/app/back/libs
RUN yarn build

FROM node:26.5.1-alpine AS production
ENV NODE_ENV=production
VOLUME ["/etc/ssl/client_certs"]
WORKDIR /var/www/app/csmr-rie
COPY --from=dependencies /var/www/app/csmr-rie/node_modules node_modules
COPY --from=builder /var/www/app/csmr-rie/dist dist
CMD ["node", "dist/main.js"]
