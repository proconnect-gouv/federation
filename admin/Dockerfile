FROM node:26.13.0-alpine AS dev

RUN apk add --no-cache bash python3 make g++ lscpu

WORKDIR /var/www/app

COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/npm-cache,id=admin-npm-cache,sharing=locked \
    --mount=type=tmpfs,target=/tmp \
    npm ci --cache=/npm-cache

COPY . ./

CMD npm run start:dev


FROM node:26.13.0-alpine AS builder

COPY . /tmp/admin

RUN apk add --no-cache python3 make g++ lscpu

WORKDIR /tmp/admin
RUN npm ci

## build fc-exploitation
WORKDIR /tmp/admin
RUN npm run build

WORKDIR /federation-admin
RUN mv /tmp/admin/package.json ./ && \
    mv /tmp/admin/.npmrc ./ && \
    mv /tmp/admin/dist ./ && \
    mv /tmp/admin/views ./

RUN mv /tmp/admin/package-lock.json ./ && \
    npm ci --omit=dev && \
    rm -f package.json */package.json package-lock.json .npmrc


FROM node:26.13.0-alpine AS production

ENV NODE_ENV=production

COPY --from=builder /federation-admin /var/www/app

WORKDIR /var/www/app

CMD ["node", "/var/www/app/dist/main.js"]
