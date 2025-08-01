ARG NODE_VERSION=22.13.0
ARG NODE_IMAGE=node:${NODE_VERSION}-alpine

FROM ${NODE_IMAGE} AS base
RUN apk add --no-cache python3 make g++ lscpu

FROM base AS deps
WORKDIR /admin
COPY package.json yarn.lock ./
COPY fc-exploitation/package.json ./fc-exploitation/
COPY shared/package.json ./shared/
# ARM64 emulation can take up to 6.4 minutes, so allow 7 minutes (420s)
RUN yarn install --frozen-lockfile --network-timeout 420000

FROM deps AS shared-builder
COPY shared/ ./shared/
RUN yarn --cwd shared run build

FROM shared-builder AS exploitation-builder
COPY fc-exploitation/ ./fc-exploitation/
RUN yarn --cwd fc-exploitation run build

FROM base AS prod-deps
WORKDIR /admin
COPY package.json yarn.lock ./
COPY fc-exploitation/package.json ./fc-exploitation/
COPY shared/package.json ./shared/
# ARM64 emulation can take up to 4.5 minutes, so allow 7 minutes (420s)
RUN yarn install  --immutable --immutable-cache --check-cache --production --network-timeout 420000

FROM ${NODE_IMAGE} AS production
WORKDIR /var/www/app
RUN npm install -g pm2
ENV PM2_HOME=/tmp/.pm2 NODE_ENV=production

COPY --from=shared-builder /admin/shared/dist ./shared/dist
COPY --from=shared-builder /admin/shared/package.json ./shared/
COPY --from=exploitation-builder /admin/fc-exploitation/dist ./fc-exploitation/dist
COPY --from=exploitation-builder /admin/fc-exploitation/views ./fc-exploitation/views
COPY --from=exploitation-builder /admin/fc-exploitation/package.json ./fc-exploitation/
COPY --from=prod-deps /admin/node_modules ./node_modules
COPY --from=prod-deps /admin/package.json ./
COPY --from=prod-deps /admin/yarn.lock ./

COPY deploy/pm2/app.json /etc/pm2/
CMD ["pm2-runtime", "/etc/pm2/app.json"]
