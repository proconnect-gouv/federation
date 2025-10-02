# PCDB API

FastAPI service for managing OIDC clients in the ProConnect federation.

## Quick Start

```bash
# Start services
docker compose up --build --wait pcdbapi

# Run tests
docker compose run --rm pcdbapi-test pytest

# Format and lint code
docker compose run -T --rm pcdbapi-test ruff format .

# Check health
curl http://localhost:8000/healthz
```

## API Endpoints

- `GET /healthz` - Health check
- `GET /api/oidc_clients` - List OIDC clients
- `POST /api/oidc_clients` - Create OIDC client
- `GET /api/oidc_clients/{id}` - Get OIDC client
- `PATCH /api/oidc_clients/{id}` - Update OIDC client

## Environment Variables

- `MONGODB_URL` - MongoDB connection string
- `MONGODB_USERNAME` - MongoDB username
- `MONGODB_PASSWORD` - MongoDB password
- `API_SECRET` - Shared secret for API authentication
- `CLIENT_SECRET_CIPHER_PASS` - Client secret encryption key
