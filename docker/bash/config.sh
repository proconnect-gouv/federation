#!/usr/bin/env bash

# Disable TTY on CI env
[ $CI ] && NO_TTY=" -T" || NO_TTY=""

#### Global Variables:
COMPOSE_PROJECT_NAME=fc
COMPOSE_DIR="${PC_ROOT}/federation/docker/compose"
COMPOSE_FILES=$(find ${COMPOSE_DIR} -not -path "${COMPOSE_DIR}/OS/*" -not -path "${COMPOSE_DIR}/CI/*" -name "*.yml")

COMPOSE_DIR_OS_SPECIFIC="${COMPOSE_DIR}/OS/$(uname -s)"
COMPOSE_FILES_OS_SPECIFIC=

if [ -d ${COMPOSE_DIR_OS_SPECIFIC} ]; then
  COMPOSE_FILES_OS_SPECIFIC=$(find ${COMPOSE_DIR_OS_SPECIFIC} -name "*.yml")
fi

COMPOSE_FILES_CI_SPECIFIC=
if [ -n "$CI" ]; then
  COMPOSE_FILES_CI_SPECIFIC=$(find "${COMPOSE_DIR}/CI" -name "*.yml")
fi

VOLUMES_DIR="${PC_ROOT}/federation/docker/volumes"
WORKING_DIR="${PC_ROOT}/federation/docker"

# https://docs.docker.com/compose/reference/envvars/#compose_file
COMPOSE_PATH_SEPARATOR=":"
COMPOSE_FILE=$(join_by ${COMPOSE_PATH_SEPARATOR} ${COMPOSE_FILES} ${COMPOSE_FILES_OS_SPECIFIC} ${COMPOSE_FILES_CI_SPECIFIC})
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

#!/usr/bin/env bash

MONGO_DEFAULT_USER="rootAdmin"
MONGO_DEFAULT_PASS="pass"

#!/usr/bin/env bash

#### Formating helpers
STYLE_SUCCESS="\e[1;36m"
STYLE_FAILURE="\e[1;41m"
STYLE_WARNING="\e[1;33m"
STYLE_EMPHASIS="\e[3m"
STYLE_RESET="\e[0;0m"


# source "${INCLUDE_DIR}/config/task.sh"
