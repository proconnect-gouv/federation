#!/usr/bin/env bash
_stop() {
  apps=${@:-no-container}
  for app in $apps; do
    task " * Stopping app \e[3m${app}\e[0m" \
      "_do_stop" "${app}"
  done
}

_do_stop() {
  local app=$1

  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} "${app}" "/opt/scripts/stop.sh"
}

_stop_all() {
  local containers=$(_get_node_containers_to_start)
  _stop $containers
}
