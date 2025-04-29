#!/usr/bin/env bash

source "$INCLUDE_DIR/hooks/exploitation.sh"
source "$INCLUDE_DIR/hooks/lemon-ldap.sh"
source "$INCLUDE_DIR/hooks/mongo.sh"

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

# Container initialisation hooks
#
# This runs arbitrary code if a container is started
# matching on the container name
#
# Hooks are called in the `docker-stack up <stack>` command,
# after all other automatic procedures.
# Nodejs dependencies are already installed at this stage
function _init_hooks() {

  local container=$1

  case $container in
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
    # Erase line content for containers that don't have an init section
    # This way we only display task for containers that have actually done something
    # Note that number of space characters is arbitrary but should work in most cases
    _task_result "\r                                                                 \r"
    ;;
  esac
}
