#!/usr/bin/env bash

_migrations-partners() {
  cd ${WORKING_DIR}
  docker-compose exec ${NO_TTY} "${1}" yarn typeorm:migrations-run
}

_migrations-generate-partners() {
  cd ${WORKING_DIR}
  docker-compose exec ${NO_TTY} "${1}" yarn typeorm:migrations-generate "${2}"
}

_fixtures_fcp_high() {
  _hook_fc_apps "exploitation-high"
}

_fixtures_fca_low() {
  _hook_fc_apps "exploitation-fca-low"
}

_fixtures-partners() {
  cd ${WORKING_DIR}
  docker-compose exec ${NO_TTY} "${1}" yarn typeorm:fixtures:load
}
