#!/usr/bin/env bash

source "$INCLUDE_DIR/hooks/exploitation.sh"
source "$INCLUDE_DIR/hooks/lemon-ldap.sh"
source "$INCLUDE_DIR/hooks/mongo.sh"

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
