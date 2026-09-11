#!/usr/bin/env bash

_migrations_postgres() {
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} "${1}" npm run typeorm:migrations-run
}

_migrations_generate_postgres() {
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} "${1}" npm run typeorm:migrations-generate -- "${2}"
}

_fixtures_postgres() {
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} "${1}" npm run typeorm:fixtures:load
}
