#!/usr/bin/env bash

_reset_mongodb() {
  echo "Reseting mongo database to default state..."
  ${DOCKER_COMPOSE} restart seed-mongo
  ${DOCKER_COMPOSE} logs --follow --no-log-prefix seed-mongo
}

_mongo_core_shell() {
  _mongo_shell "mongo-fca-low" "core-fca-low" "$@"
}

_mongo_shell() {
  local server=$1
  local database=$2

  >&2 echo "Starting mongo shell in ${server}..."

  $DOCKER_COMPOSE exec "${server}" \
    mongo -u ${MONGO_DEFAULT_USER} -p ${MONGO_DEFAULT_PASS} \
    --authenticationDatabase admin "${database}" \
    --tls "${@:3}"
}

_mongo_script() {
  container=$1
  script=$2

  $DOCKER_COMPOSE exec -T ${container} /opt/scripts/run.sh "${script}"
}
