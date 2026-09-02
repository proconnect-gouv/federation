FROM node:24.20.0-alpine AS app

WORKDIR /var/www/app

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache,id=mock-service-provider-yarn-cache,sharing=locked \
    yarn install --immutable --production
COPY src/ ./src/

FROM app AS dev

CMD ["node", "--watch", "src/main.ts"]

FROM app AS production

ENV NODE_ENV=production

CMD ["node", "src/main.ts"]
