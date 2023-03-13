#!/usr/bin/env bash

_test() {
  apps=${@:-no-container}
  for app in $apps
  do
    cd ${WORKING_DIR} && docker-compose exec $NO_TTY $app "/opt/scripts/test.sh" || err=true
  done
}

_e2e() {
  app=${1:-no-container}
  [ $# -gt 0 ] && shift
  case "$app" in
    *)
      echo "Usage: $script <option>:"
      echo "----"
      echo "* e2e ==> only this stack are allowed :"
      echo "@todo Implements this"
      echo "----"
      exit 1
    ;;
  esac
  command="open"
  if [ "${@:-xxx}" = "run" ]
  then
    command='run'
  fi
  cd ${FC_ROOT}/${directory} && npx cypress ${command}
}

_start_ci() {
  apps=${@:-no-container}
  for app in $apps
  do
    echo "Starting ${app} app..."
    cd ${WORKING_DIR} && docker-compose exec $NO_TTY ${app} "/opt/scripts/start-ci.sh" || err=true
  done
}

_fixtures_fcp_high() {
  echo "**************************************"
  echo " Resetting fixtures in database..."
  echo "**************************************"
  apps="exploitation-high"
  for app in $apps
  do
    echo "**************************************"
    echo "\n\nFixture for ${app} app...\n\n"
    echo "**************************************"
    cd ${WORKING_DIR}
    docker-compose exec $NO_TTY ${app} yarn typeorm schema:drop
    docker-compose exec $NO_TTY ${app} yarn migrations:run
    docker-compose exec $NO_TTY ${app} yarn fixtures:load

    cd ${FC_ROOT}/fc-apps/shared/cypress/support/ && ./db.sh ${app} create
  done

  echo "**************************************"
  echo "\n\n\n FIXTURES DONE ! \n\n\n"
  echo "**************************************"
}

_fixtures_fca_low() {
  echo "**************************************"
  echo " Resetting fixtures in database..."
  echo "**************************************"
  apps="exploitation-fca-low"
  for app in $apps
  do
    echo "**************************************"
    echo "\n\nFixture for ${app} app...\n\n"
    echo "**************************************"
    cd ${WORKING_DIR}
    docker-compose exec $NO_TTY ${app} yarn typeorm schema:drop
    docker-compose exec $NO_TTY ${app} yarn migrations:run
    docker-compose exec $NO_TTY ${app} yarn fixtures:load

    cd ${FC_ROOT}/fc-apps/shared/cypress/support/ && ./db.sh ${app} create
  done

  echo "**************************************"
  echo "\n\n\n FIXTURES DONE ! \n\n\n"
  echo "**************************************"
}

_fixtures-partners() {
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY $1 yarn typeorm:fixtures:load
}

_storybook() {
  echo "**************************************"
  echo " Up and Start Storybook..."
  echo "**************************************"
  cd ${WORKING_DIR} && docker-compose up storybook
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY storybook "/opt/scripts/install.sh" || err=true
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY storybook "/opt/scripts/start.sh" || err=true
  echo "**************************************"
  echo "\n\n\n Storybook DONE ! \n\n\n"
  echo "**************************************"
}

