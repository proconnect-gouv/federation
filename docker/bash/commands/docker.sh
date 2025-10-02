#!/usr/bin/env bash

# Find which nodejs containers to start
_get_node_containers_to_start() {
  local raw_nodejs_containers=$(
    for container in $ancestor_containers $pattern_containers; do
      _container_to_compose_name "$container"
    done | sort | uniq
  )

  echo ${raw_nodejs_containers}
}

_container_to_compose_name() {
  local input=$1
  local output=""

  for container in ${input}; do
    local name=$(echo ${container} | sed -E 's/^pc-(.*)-1$/\1/')
    output=$(echo -e "${output}\n${name}")
  done

  echo ${output}
}

_halt() {
  echo "Stopping FC Dev environment..."
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE stop
}

_compose() {
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE "${@}"
}

_exec() {
  app=${1:-empty}
  [ $# -gt 0 ] && shift

  case ${app} in
  empty)
    echo "Usage: dks exec <container_name> <command>"
    exit 1
    ;;
  *)
    cd ${WORKING_DIR}
    $DOCKER_COMPOSE exec ${NO_TTY} ${app} ${@}
    ;;
  esac
}

_prune() {
  _halt
  $DOCKER_COMPOSE down -v --remove-orphans
}

_prune_all() {
  cat "${DOCKER_BASH_DIR}/txt/atomic.art.txt"
  _halt
  docker system prune -af
  docker image prune -af
  docker system prune -af --volumes
  docker system df
  npm cache clean --force
  yarn cache clean
  sudo du -sh /var/cache/apt/archives
  cd ${FEDERATION_DIR}
  find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
}

_prune_ci() {
  $DOCKER_COMPOSE down --volumes --remove-orphans
}

_switch() {
  _prune
  _logs "--bg"
  _up "${@}"
}
