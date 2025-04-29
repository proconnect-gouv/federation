#!/usr/bin/env bash
_do_up() {
  # Get wanted services

  echo "TEST========>  ${@}"
  local services=$(_get_services "$@")
  echo "Services ========>  ${services}"

  cd ${WORKING_DIR}
  $DOCKER_COMPOSE up --build -d $services
}


_logs() {
  local option=$1

  case ${option} in
  --bg)
    task " * Start log-hub" "_do_up" "log-hub"
    echo "   Log are now available through chrome developer-tools at localhost:6666"
    ;;
  --restart)
    $DOCKER_COMPOSE restart log-hub
    ;;
  *)
    $DOCKER_COMPOSE up log-hub | sed 's/log-hub.*|//'
    ;;
  esac
}
