#!/usr/bin/env bash

_log() {
  app=${@:-no-container}
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} ${app} pm2 logs
}

_detect_instances() {
  local apps="${@:-no-container}"
  local instances=$(
    for app in ${apps}; do
      _get_env "${app}" "NESTJS_INSTANCE"
    done
  )

  echo "${instances}" | sort | uniq | grep -oE "[a-zA-Z0-9-]+"
}

_clean_pc_dist() {
  local apps="${@:-no-container}"
  local instances=$(_detect_instances "${apps}")

  cd ${VOLUMES_DIR}

  for instance in ${instances}; do
    echo "    * Purging build dir for ${instance}"
    rm -rf "src/fc/back/dist/instances/${instance}"
  done
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

_log_rotate() {
  echo "Send SIGUSR2 to core-fcp-high app..."
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec core-fcp-high pkill -SIGUSR2 -f '/usr/bin/node -r source-map-support/register --inspect=0.0.0.0:9235 /var/www/app/dist/instances/core-fcp-high/main'
  echo "... Signal done"
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
