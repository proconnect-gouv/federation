#!/usr/bin/env bash
NODE_VERSION=v24.11.0
export  NODE_VERSION

DOCKER_COMPOSE="docker compose"

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
      echo "  Fixtures for admin app..."
      cd ${WORKING_DIR}
      ${DOCKER_COMPOSE} exec ${NO_TTY} "admin" yarn typeorm schema:drop
      ${DOCKER_COMPOSE} exec ${NO_TTY} "admin" yarn migrations:run
      ${DOCKER_COMPOSE} exec ${NO_TTY} "admin" yarn fixtures:load

      (cd ${FEDERATION_DIR}/admin/cypress/support/ && docker exec pc-pg-"admin"-1 bash -c "$(cat create-db-backup.sh)")
      ;;
    *)
      ;;
    esac
  done
}
