#!/usr/bin/env bash

_log() {
  app=${@:-no-container}
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} ${app} pm2 logs
}

_start() {
  local apps="${@:-no-container}"
  _clean_pc_dist "${apps}"

  for app in ${apps}; do
    if [[ "${app}" == "no-container" ]]; then
      continue
    fi
    echo "   * Starting app ${app}"
      _do_start "${app}"
  done

  # Reload RP in case the app took to long and was considered down by Nginx
  _reload_rp
}

_start_prod() {
  local apps="${@:-no-container}"
  _clean_pc_dist "${apps}"

  for app in ${apps}; do
    if [[ "${app}" == "no-container" ]]; then
      continue
    fi
    task "   * Starting app \e[3m${app}\e[0m" \
      "_do_start_prod" "${app}"
  done

  # Reload RP in case the app took to long and was considered down by Nginx
  _reload_rp
}

_start_dev() {
  local apps="${@:-no-container}"
  for app in ${apps}; do
    if [[ "${app}" == "no-container" ]]; then
      continue
    fi
    task "   * Starting app \e[3m${app}\e[0m" \
      "_do_start_dev" "${app}"
  done

  # Reload RP in case the app took to long and was considered down by Nginx
  _reload_rp
}

_start_ci() {
  local apps="${@:-no-container}"
  for app in ${apps}; do
    if [[ "${app}" == "no-container" ]]; then
      continue
    fi
    _do_start_ci "${app}"
  done

  # Reload RP in case the app took to long and was considered down by Nginx
  _reload_rp
}

_detect_instances() {
  local apps="${@:-no-container}"
  local instances=$(
    for app in ${apps}; do
      if [[ "${app}" == "no-container" ]]; then
        continue
      fi
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

_do_start() {
  local app=$1

  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} "${app}" "/opt/scripts/start.sh"
}

_do_start_ci() {
  local app=$1

  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} "${app}" "/opt/scripts/start-ci.sh"
}

_do_start_dev() {
  local app=$1

  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} "${app}" "/opt/scripts/start-dev.sh"
}

_do_start_prod() {
  local app=$1

  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec ${NO_TTY} "${app}" "/opt/scripts/start-prod.sh"
}

_start_all() {
  _get_running_containers
  echo " * Automatically start apps for started nodejs containers"
  _start "${NODEJS_CONTAINERS}"
}

_start_all_ci() {
  _get_running_containers
  echo " * Automatically start apps for started nodejs containers"
  _start_ci "${NODEJS_CONTAINERS}"
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
  _get_running_containers
  _stop $NODEJS_CONTAINERS
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
  rm -rf admin/fc-exploitation/node_modules
  rm -rf admin/shared/node_modules

  rm -rf admin/fc-exploitation/dist
  rm -rf admin/shared/dist
  rm -rf back/dist

  echo "Done cleaning"
}
