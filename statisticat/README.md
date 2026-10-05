## Statisticat

Statisticat generates a CSV file from the logs from Loki for Statistics.

A first job (not implemented for now), `extract-daily-logs`, extracts logs from Loki, transforms and anonymizes them into a CSV, and publishes the CSV to a private S3 endpoint.

A second job, `s3-transfer`, transfers the CSV from the private S3 endpoint to a public S3 endpoint.

## Use in prod

```
PRIVATE_S3_ACCESS_KEY_ID="<privateId>" PRIVATE_S3_SECRET_ACCESS_KEY="<privateKey>"  PUBLIC_S3_ACCESS_KEY_ID="publicKey" PUBLIC_S3_SECRET_ACCESS_KEY="publicKey" yarn run transfer
```

## Use in dev

```
npm run transfer:dev
```
