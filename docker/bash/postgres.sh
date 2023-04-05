#!/usr/bin/env bash

_migrations-partners() {
  cd ${WORKING_DIR}
  docker-compose exec ${NO_TTY} "${1}" yarn typeorm:migrations-run
}

_migrations-generate-partners() {
  cd ${WORKING_DIR}
  docker-compose exec ${NO_TTY} "${1}" yarn typeorm:migrations-generate "${2}"
}

_init-fcapps() {
  apps=${@:-fc-exploitation fc-support fc-stats}

  for app in ${apps}
  do
    echo "  Fixture for ${app} app..."
    cd ${WORKING_DIR}
    docker-compose exec ${NO_TTY} "${app}" yarn typeorm schema:drop
    docker-compose exec ${NO_TTY} "${app}" yarn migrations:run
    docker-compose exec ${NO_TTY} "${app}" yarn fixtures:load

    cd ${FC_ROOT}/fc-apps/shared/cypress/support/ && ./db.sh ${app:3} create
  done
}

_fixtures_fcp_high() {
  _init-fcapps "exploitation-high"
}

_fixtures_fca_low() {
  _init-fcapps "exploitation-fca-low"
}

_fixtures-partners() {
  cd ${WORKING_DIR}
  docker-compose exec ${NO_TTY} "${1}" yarn typeorm:fixtures:load
}
