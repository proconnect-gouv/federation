## Statisticat

Statisticat generates a CSV file from the logs from Loki for Statistics.

A first job, `extract-daily-logs`, extracts logs from Loki, transforms and anonymizes them into a CSV, and publishes the CSV to a private S3 endpoint.

A second job, `s3-transfer`, transfers the CSV from the private S3 endpoint to a public S3 endpoint.

## Use in prod

```
npm run extract
```

```
npm run transfer
```

## Use in dev

```
npm run extract:dev
```

```
npm run transfer:dev
```
