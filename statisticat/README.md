## Statisticat

Statisticat generates a CSV file from the logs from Loki for Statistics.

A first job (not implemented for now), `extract-daily-logs`, extracts logs from Loki, transforms and anonymizes them into a CSV, and publishes the CSV to a private S3 endpoint.

A second job, `s3-transfer`, transfers the CSV from the private S3 endpoint to a public S3 endpoint.

## Use in prod

WIP

```
PRIVATE_S3_ACCESS_KEY_ID="" PRIVATE_S3_SECRET_ACCESS_KEY=""  PUBLIC_S3_ACCESS_KEY_ID="" PUBLIC_S3_ACCESS_KEY_ID="" PUBLIC_S3_SECRET_ACCESS_KEY="" yarn run transfer
```

## Use in dev

Not implemented

```
npm run extract:dev
```

WIP

```
npm run transfer:dev
```
