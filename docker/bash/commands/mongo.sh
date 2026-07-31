#!/usr/bin/env bash

_reset_mongodb() {
  local db_container_name=${1:-mongo}
  echo "Reseting database ${db_container_name} to default state..."
  $DOCKER_COMPOSE exec ${NO_TTY} "${db_container_name}" sh -c \
    'mongosh --host "$HOSTNAME" -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin "$MONGO_INITDB_DATABASE" --quiet --eval "load(\"/opt/scripts/db-states/mongo-reset.js\")"'
}

# Rate limiter counters live in redis-pwd db 4, shared with OIDC sessions
# (OIDC-P* keys, core/core-rie/fsa*-low/moncomptepro all point at the same db).
# cy.resetMongo() never touched this, so re-running a rate-limit scenario
# within its window (e.g. VERIFY_EMAIL_TOKEN's 5min) inherited leftover points
# from the previous run. Only the rate-limiter keys are cleared -- a FLUSHDB
# here would also wipe any SP session created just before the reset step.
_reset_redis() {
  echo "Reseting redis-pwd rate-limiter state..."
  $DOCKER_COMPOSE exec ${NO_TTY} redis-pwd sh -c \
    'redis-cli -n 4 -a "$REDIS_PASSWORD" --no-auth-warning --scan --pattern "rate-limiter-*" | xargs -r redis-cli -n 4 -a "$REDIS_PASSWORD" --no-auth-warning DEL'
}

# Presets for backward compatibility
_reset_db_core_fca_low() {
  _reset_mongodb
  _reset_redis
  echo "Reseeding core-fca-low..."
  $DOCKER_COMPOSE run --rm ${NO_TTY} --no-deps core yarn run seed
}
