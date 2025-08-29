#!/usr/bin/env bash

_log() {
  app=${@:-no-container}
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} ${app} pm2 logs
}

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

_clean() {
  echo "Cleaning node_modules and dist directories"
  cd ${FEDERATION_DIR}

  rm -rf back/node_modules
  rm -rf admin/node_modules
  rm -rf admin/node_modules

  rm -rf admin/dist
  rm -rf back/dist

  echo "Done cleaning"
}
