#!/usr/bin/env bash
NODE_VERSION=v22.13.0
export  NODE_VERSION

DOCKER_COMPOSE="docker compose"

function _hook_fc_apps() {
  local apps=${@:-fc-exploitation}

  for app in ${apps}; do
    local db_container=$(echo "$app" | sed 's/^fc-*//')
    echo "  Fixture for ${app} app..."
    cd ${WORKING_DIR}
    ${DOCKER_COMPOSE} exec ${NO_TTY} "${app}" yarn typeorm schema:drop
    ${DOCKER_COMPOSE} exec ${NO_TTY} "${app}" yarn migrations:run
    ${DOCKER_COMPOSE} exec ${NO_TTY} "${app}" yarn fixtures:load

    cd ${PC_ROOT}/federation-admin/shared/cypress/support/ && ./db.sh ${db_container} create
  done
}

#!/usr/bin/env bash

function _hook_lemon_ldap() {
  # Sleep to wait for configuration initialization
  echo "Restore LemonLDAP configuration"
  cd ${WORKING_DIR}
  ${DOCKER_COMPOSE} exec fia-llng-low bash /scripts/init.sh
  echo "Loaded !"
}

#!/usr/bin/env bash

function _hook_mongo() {
  local app="$1"

  # Sleep to wait for mongodb replicat initialization
  sleep 10
  _reset_mongodb "$app"
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
  $DOCKER_COMPOSE up --build -d $services

  # Find which nodejs containers are running and store it into $NODEJS_CONTAINERS
  echo " * Populate global variables"
  local raw_nodejs_containers=$(docker ps --format '{{.Names}}' -f ancestor=${PC_DOCKER_REGISTRY}/nodejs:${NODE_VERSION}-dev)

  echo " * Found nodejs containers: ${raw_nodejs_containers}"

  local raw_all_containers=$(docker ps --format '{{.Names}}')
  NODEJS_CONTAINERS=$(_container_to_compose_name "${raw_nodejs_containers}")
  
  # Find all containers and store it into $FC_CONTAINERS
  FC_CONTAINERS=$(_container_to_compose_name "${raw_all_containers}")

  # Execute starting scripts in build containers
  echo " * Automatically install dependencies for started containers"
  
  if [ "${NODEJS_CONTAINERS:-xxx}" != "xxx" ]; then
    echo "Installing node modules..."
    echo " * Installing dependencies for $(format_emphasis "${NODEJS_CONTAINERS}")"

    apps=${@:-no-container}

    for app in ${NODEJS_CONTAINERS}; do
      echo "Installing dependencies for ${app}:"
      cd ${WORKING_DIR}
      $DOCKER_COMPOSE exec ${NO_TTY} "${app}" sh -c "cd /var/www/app && yarn install --frozen-lockfile --ignore-engines"
    done
  fi

  echo " * Automatically run init scripts for started containers"
  for app in ${FC_CONTAINERS}; do
    # Container initialisation hooks
    #
    # This runs arbitrary code if a container is started
    # matching on the container name
    #
    # Hooks are called in the `docker-stack up <stack>` command,
    # after all other automatic procedures.
    # Nodejs dependencies are already installed at this stage
    case $app in
    *"lemon-ldap"*)
      _hook_lemon_ldap
      ;;
    *"mongo-fca-low"*)
      _hook_mongo "mongo-fca-low"
      ;;
    *"pg-exploitation-fca-low")
      _hook_fc_apps "exploitation-fca-low"
      ;;
    *)
      ;;
    esac
  done
}
