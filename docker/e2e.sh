#!/usr/bin/env bash
set -e

if [ -z "$FC_ROOT"  ]
then
  read -p "Missing FC_ROOT path. Please fill in: " FC_ROOT
fi

#### Global Functions:
function join_by { local IFS="$1"; shift; echo "$*"; }

#### Global Variables:
DEFAULT_NODE_VERSION=v12.20.0
DOCKER_REPOSITORY_PREFIX=gitlab.dev-franceconnect.fr:5005/france-connect/infra
COMPOSE_FILES=$(find $FC_ROOT/fc/docker/compose -name "*.yml")
WORKING_DIR="$( cd "$( dirname "$0" )" >/dev/null 2>&1 && pwd )"

# https://docs.docker.com/compose/reference/envvars/#compose_file
COMPOSE_PATH_SEPARATOR=":"
COMPOSE_FILE=$(join_by $COMPOSE_PATH_SEPARATOR $COMPOSE_FILES)
export COMPOSE_PATH_SEPARATOR
export COMPOSE_FILE

# Get current uid/gid to use it within docker-compose:
# see https://medium.com/redbubble/running-a-docker-container-as-a-non-root-user-7d2e00f8ee15
# Modf 2020-06-04: récupération de l'id du groupe docker (nécessaire pour le conteneur 'docker-gen')
export CURRENT_UID="$(id -u):$(grep docker /etc/group | cut -d: -f3)"

# Fix node version to use
if [ "${NODE_VERSION:-xxx}" = "xxx" ]
then
  NODE_VERSION=${DEFAULT_NODE_VERSION}
fi
export NODE_VERSION

_e2e_idp_insert() {
  echo "Insert idp in database..."
  cd ${WORKING_DIR} && docker-compose exec -T mongo4 mongo -u 'fc' -p 'pass' --host mongo4 --tls --tlsCAFile /etc/ssl/ca.crt --authenticationDatabase corev2 corev2 /opt/scripts/e2e-idp-insert.js
}

_e2e_idp_update_activate() {
  echo "Update idp in database, activate idp..."
  cd ${WORKING_DIR} && docker-compose exec -T mongo4 mongo -u 'fc' -p 'pass' --host mongo4 --tls --tlsCAFile /etc/ssl/ca.crt --authenticationDatabase corev2 corev2 /opt/scripts/e2e-idp-update-activate.js
}

_e2e_idp_update_desactivate() {
  echo "Update idp in database, desactivate idp..."
  cd ${WORKING_DIR} && docker-compose exec -T mongo4 mongo -u 'fc' -p 'pass' --host mongo4 --tls --tlsCAFile /etc/ssl/ca.crt --authenticationDatabase corev2 corev2 /opt/scripts/e2e-idp-update-desactivate.js
}

_e2e_idp_remove() {
  echo "Remove idp in database..."
  cd ${WORKING_DIR} && docker-compose exec -T mongo4 mongo -u 'fc' -p 'pass' --host mongo4 --tls --tlsCAFile /etc/ssl/ca.crt --authenticationDatabase corev2 corev2 /opt/scripts/e2e-idp-remove.js
}

_e2e_fca_idp_insert() {
  echo "Insert idp in database..."
  cd ${WORKING_DIR} && docker-compose exec -T mongo-fca mongo -u 'fc' -p 'pass' --host mongo-fca --tls --tlsCAFile /etc/ssl/ca.crt --authenticationDatabase corev2 corev2 /opt/scripts/e2e-idp-insert.js
}

_e2e_fca_idp_update_activate() {
  echo "Update idp in database, activate idp..."
  cd ${WORKING_DIR} && docker-compose exec -T mongo-fca mongo -u 'fc' -p 'pass' --host mongo-fca --tls --tlsCAFile /etc/ssl/ca.crt --authenticationDatabase corev2 corev2 /opt/scripts/e2e-idp-update-activate.js
}

_e2e_fca_idp_update_desactivate() {
  echo "Update idp in database, desactivate idp..."
  cd ${WORKING_DIR} && docker-compose exec -T mongo-fca mongo -u 'fc' -p 'pass' --host mongo-fca --tls --tlsCAFile /etc/ssl/ca.crt --authenticationDatabase corev2 corev2 /opt/scripts/e2e-idp-update-desactivate.js
}

_e2e_fca_idp_remove() {
  echo "Remove idp in database..."
  cd ${WORKING_DIR} && docker-compose exec -T mongo-fca mongo -u 'fc' -p 'pass' --host mongo-fca --tls --tlsCAFile /etc/ssl/ca.crt --authenticationDatabase corev2 corev2 /opt/scripts/e2e-idp-remove.js
}



script=$0
action=${1:-help}
[ $# -gt 0 ] && shift
case "$action" in
  idp_insert)
    _e2e_idp_insert $@
    ;;

  idp_update_activate)
    _e2e_idp_update_activate $@
    ;;

  idp_update_desactivate)
    _e2e_idp_update_desactivate $@
    ;;

  idp_remove)
    _e2e_idp_remove $@
    ;;
  fca_idp_insert)
    _e2e_fca_idp_insert $@
    ;;

  fca_idp_update_activate)
    _e2e_fca_idp_update_activate $@
    ;;

  fca_idp_update_desactivate)
    _e2e_fca_idp_update_desactivate $@
    ;;

  fca_idp_remove)
    _e2e_fca_idp_remove $@
    ;;
esac
