#!/usr/bin/env bash


_migrations-partners() {
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY $1 yarn typeorm:migrations-run
}

_migrations-generate-partners() {
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY $1 yarn typeorm:migrations-generate $2
}

_init-fcapps() {
  echo "**************************************"
  echo " Resetting fixtures in database..."
  echo "**************************************"
  apps=${@:-fc-exploitation fc-support fc-stats}
  for app in $apps
  do
    echo "**************************************"
    echo "  Fixture for ${app} app..."
    echo "**************************************"
    cd ${WORKING_DIR}
    docker-compose exec $NO_TTY "${app}" yarn typeorm schema:drop
    docker-compose exec $NO_TTY "${app}" yarn migrations:run
    docker-compose exec $NO_TTY "${app}" yarn fixtures:load

    cd ${FC_ROOT}/fc-apps/shared/cypress/support/ && ./db.sh ${app:3} create
  done

  echo "**************************************"
  echo "\n\n\n FIXTURES DONE ! \n\n\n"
  echo "**************************************"
}