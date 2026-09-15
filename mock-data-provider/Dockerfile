FROM node:24.21.0-alpine AS app

WORKDIR /var/www/app

COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/npm-cache,id=mock-data-provider-npm-cache,sharing=locked \
    npm ci --omit=dev --cache=/npm-cache
COPY src/ ./src/

FROM app AS dev

CMD ["node", "--watch", "src/main.ts"]

FROM app AS production

ENV NODE_ENV=production

CMD ["node", "src/main.ts"]
