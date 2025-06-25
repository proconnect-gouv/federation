#!/usr/bin/env bash
NODE_VERSION=v22.13.0
export  NODE_VERSION

DOCKER_COMPOSE="docker compose"

function _hook_admin() {
  local app="exploitation-fca-low"
  echo "  Fixtures for ${app} app..."
  cd ${WORKING_DIR}
  ${DOCKER_COMPOSE} exec ${NO_TTY} "${app}" yarn typeorm schema:drop
  ${DOCKER_COMPOSE} exec ${NO_TTY} "${app}" yarn migrations:run
  ${DOCKER_COMPOSE} exec ${NO_TTY} "${app}" yarn fixtures:load

  (cd ${FEDERATION_DIR}/admin/shared/cypress/support/ && ./db.sh ${app} create)
}

_up() {
  echo " * Get required services"
  # get asked services
  local apps=${@:-none}
  local services=rp-all

  for app in $apps; do
    services="$services $app"
  done
  echo " * Required services are: ${services}"

  # docker compose up services
  echo " * Docker compose up services: ${services}"
  cd ${WORKING_DIR}
  # $DOCKER_COMPOSE watch $services
  $DOCKER_COMPOSE up --build -d $services

  # Find all containers and store it into $FC_CONTAINERS
  local raw_all_containers=$(docker ps --format '{{.Names}}') 
  FC_CONTAINERS=$(_container_to_compose_name "${raw_all_containers}")

  echo " * Automatically run init scripts for started containers"
  for app in ${FC_CONTAINERS}; do
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
      ${DOCKER_COMPOSE} exec fia-llng-low bash /scripts/init.sh
      echo "Loaded !"
      ;;
    *"mongo-fca-low"*)
      _reset_mongodb "$app"
      ;;
    *"pg-exploitation-fca-low")
       _hook_admin "exploitation-fca-low"
      ;;
    *)
      ;;
    esac
  done
}
