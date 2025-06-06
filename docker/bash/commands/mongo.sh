#!/usr/bin/env bash

_reset_mongodb() {
  local db_container_name=$1
  echo "Reseting database ${db_container_name} to default state..."
  $DOCKER_COMPOSE exec ${NO_TTY} ${db_container_name} /opt/scripts/manage.sh --reset-db
}

_reset_mongodb_as_prod() {
  local db_container_name=$1
  echo "Reseting database ${db_container_name} to some production states"
  cd ${WORKING_DIR} && $DOCKER_COMPOSE exec ${NO_TTY} ${db_container_name} /opt/scripts/manage.sh --reset-db=display-idp-as-in-prod
}

_mongo_core_shell() {
  local app_name=$1
  _mongo_shell "mongo-$app_name" "core-$app_name"
}

_mongo_shell() {
  local server=$1
  local database=$2

  echo "starting mongo ${server} database in shell..."

  $DOCKER_COMPOSE exec "${server}" \
    mongo -u ${MONGO_DEFAULT_USER} -p ${MONGO_DEFAULT_PASS} \
    --authenticationDatabase admin "${database}" \
    --tls
}

_mongo_script() {
  container=$1
  script=$2

  $DOCKER_COMPOSE exec -T ${container} /opt/scripts/run.sh "${script}"
}

# Presets for backward compatibility
_reset_db_core_fca_low() {
  _reset_mongodb "mongo-fca-low"
}

_mongo_shell_core_fca_low() {
  _mongo_core_shell "fca-low"
}
