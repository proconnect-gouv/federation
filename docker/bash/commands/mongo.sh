#!/usr/bin/env bash

_reset_mongodb() {
  local db_container_name=${1:-mongo}
  echo "Reseting database ${db_container_name} to default state..."
  $DOCKER_COMPOSE exec ${NO_TTY} "${db_container_name}" sh -c \
    'mongosh --host "$HOSTNAME" -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin "$MONGO_INITDB_DATABASE" --quiet --eval "load(\"/opt/scripts/db-states/mongo-reset.js\"); load(\"/opt/scripts/db-states/_default/index.js\")"'
}

# Presets for backward compatibility
_reset_db_core_fca_low() {
  _reset_mongodb
}
