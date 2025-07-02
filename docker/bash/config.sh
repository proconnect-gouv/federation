#!/usr/bin/env bash

# Disable TTY on CI env
[ $CI ] && NO_TTY=" -T" || NO_TTY=""

#### Global Variables:
COMPOSE_PROJECT_NAME=pc
COMPOSE_DIR="${DOCKER_DIR}/compose"
COMPOSE_FILES=$(find ${COMPOSE_DIR} -not -path "${COMPOSE_DIR}/OS/*" -not -path "${COMPOSE_DIR}/CI/*" -name "*.yml")

COMPOSE_DIR_OS_SPECIFIC="${COMPOSE_DIR}/OS/$(uname -s)"
COMPOSE_FILES_OS_SPECIFIC=

if [ -d ${COMPOSE_DIR_OS_SPECIFIC} ]; then
  COMPOSE_FILES_OS_SPECIFIC=$(find ${COMPOSE_DIR_OS_SPECIFIC} -name "*.yml")
fi

VOLUMES_DIR="${DOCKER_DIR}/volumes"
WORKING_DIR="${DOCKER_DIR}"

# https://docs.docker.com/compose/reference/envvars/#compose_file
COMPOSE_PATH_SEPARATOR=":"
COMPOSE_FILE=$(join_by ${COMPOSE_PATH_SEPARATOR} ${COMPOSE_FILES} ${COMPOSE_FILES_OS_SPECIFIC})
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

export LOGS_PATH="${WORKING_DIR}/volumes/log"

MONGO_DEFAULT_USER="rootAdmin"
MONGO_DEFAULT_PASS="pass"

#### Formating helpers
STYLE_SUCCESS="\e[1;36m"
STYLE_FAILURE="\e[1;41m"
STYLE_WARNING="\e[1;33m"
STYLE_EMPHASIS="\e[3m"
STYLE_RESET="\e[0;0m"

export __DKS_LAST_LOG_FILE="${LOGS_PATH}/docker_stack_last.log"
# Exit code reserved to return data to the be displayed by `task` instead of simple success/failure
export __DKS_TASK_RETURN_EXIT_CODE=42
