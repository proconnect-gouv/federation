FROM node:26.13.0-alpine

WORKDIR /var/www/app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/npm-cache,id=statisticat-npm-cache,sharing=locked \
  --mount=type=tmpfs,target=/tmp \
  npm ci --omit=dev --cache=/npm-cache
COPY src ./src

ENTRYPOINT ["node"]
CMD ["src/jobs/s3-transfer.ts"]
