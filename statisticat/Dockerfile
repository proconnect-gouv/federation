FROM node:24.21.0-alpine AS builder

WORKDIR /var/www/app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/npm-cache,id=statisticat-npm-cache,sharing=locked \
  --mount=type=tmpfs,target=/tmp \
  npm ci --cache=/npm-cache

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24.21.0-alpine AS production

WORKDIR /var/www/app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/npm-cache,id=statisticat-npm-cache,sharing=locked \
  --mount=type=tmpfs,target=/tmp \
  npm ci --omit=dev --cache=/npm-cache
COPY --from=builder /var/www/app/dist/src ./scripts

ENTRYPOINT ["node"]
CMD ["scripts/extract-daily-logs.js"]
