#!/usr/bin/env bash
NODE_VERSION=v24.10.0
export  NODE_VERSION

DOCKER_COMPOSE="docker compose"

function _hook_admin() {
  local app=$1
  echo "  Fixtures for ${app} app..."
  cd ${WORKING_DIR}
  ${DOCKER_COMPOSE} exec ${NO_TTY} "${app}" yarn typeorm schema:drop
  ${DOCKER_COMPOSE} exec ${NO_TTY} "${app}" yarn migrations:run
  ${DOCKER_COMPOSE} exec ${NO_TTY} "${app}" yarn fixtures:load

  (cd ${FEDERATION_DIR}/admin/cypress/support/ && ./db.sh ${app} create)
}

_up() {
  # get asked services
  local services=${@}

  # docker compose up services
  echo " * Docker compose up services: ${services}"
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE up --build -d $services

  # Find which containers are running and run their hooks
  echo " * Running hooks for started containers"
  local started_services=$($DOCKER_COMPOSE ps --format '{{.Service}}')
  for app in ${started_services}; do
    # Container initialization hooks
    #
    # This runs arbitrary code if a container is started
    # matching on the container name
    #
    # Hooks are called in the `docker-stack up <stack>` command,
    # after all other automatic procedures.
    # Nodejs dependencies are already installed at this stage
    case $app in
    *"lemon-ldap"*)
      echo "Restore LemonLDAP configuration"
      cd ${WORKING_DIR}
      ${DOCKER_COMPOSE} exec identity-provider-llng bash /scripts/init.sh
      echo "Loaded !"
      ;;
    *"mongo-fca-low"*)
      _reset_mongodb "$app"
      ;;
    *"pg-admin")
       _hook_admin "admin"
      ;;
    *)
      ;;
    esac
  done
}
