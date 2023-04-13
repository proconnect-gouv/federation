#!/usr/bin/env bash

function _hook_fc_apps() {
  apps=${@:-fc-exploitation fc-support}

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