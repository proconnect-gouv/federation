#!/usr/bin/env bash

#### Global Variables:
COMPOSE_PROJECT_NAME=fc
DEFAULT_NODE_VERSION=latest
COMPOSE_DIR="${FC_ROOT}/fc/docker/compose"
COMPOSE_FILES=$(find ${COMPOSE_DIR} -name "*.yml")
VOLUMES_DIR="${FC_ROOT}/fc/docker/volumes"
WORKING_DIR="$(cd "$(dirname "${0}")" >/dev/null 2>&1 && pwd)"

DOCKER_REGISTERY_URI="registry.gitlab.dev-franceconnect.fr/france-connect/fc-docker/nodejs:${DEFAULT_NODE_VERSION}-dev"

MONGO_DEFAULT_USER="rootAdmin"
MONGO_DEFAULT_PASS="pass"

__DKS_LAST_LOG_FILE="/tmp/docker_stack_last.log"

# Exit code reserved to return data to the be displayed by `task` instead of simple success/failure
__DKS_TASK_RETURN_EXIT_CODE=42

#### Formating helpers
STYLE_SUCCESS="\e[1;36m"
STYLE_FAILURE="\e[1;41m"
STYLE_WARNING="\e[1;33m"
STYLE_EMPHASIS="\e[3m"
STYLE_RESET="\e[0;0m"

# https://docs.docker.com/compose/reference/envvars/#compose_file
COMPOSE_PATH_SEPARATOR=":"
COMPOSE_FILE=$(join_by ${COMPOSE_PATH_SEPARATOR} ${COMPOSE_FILES})
export COMPOSE_PATH_SEPARATOR
export COMPOSE_FILE
export COMPOSE_DIR
export VOLUMES_DIR
export COMPOSE_PROJECT_NAME
export WORKING_DIR

# Get current uid/gid to use it within docker-compose:
# see https://medium.com/redbubble/running-a-docker-container-as-a-non-root-user-7d2e00f8ee15
# Modf 2020-06-04: récupération de l'id du groupe docker (nécessaire pour le conteneur 'docker-gen')
export CURRENT_UID="$(id -u):$(grep docker /etc/group | cut -d: -f3)"

# Fix node version to use
if [ "${NODE_VERSION:-xxx}" = "xxx" ]; then
  NODE_VERSION=${DEFAULT_NODE_VERSION}
fi
export NODE_VERSION

# Disable TTY on CI env
[ $CI ] && NO_TTY=" -T" || NO_TTY=""
