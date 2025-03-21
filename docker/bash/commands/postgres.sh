#!/usr/bin/env bash

_migrations_postgres() {
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} "${1}" yarn typeorm:migrations-run
}

_migrations_generate_postgres() {
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} "${1}" yarn typeorm:migrations-generate "${2}"
}

_fixtures_postgres() {
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} "${1}" yarn typeorm:fixtures:load
}
