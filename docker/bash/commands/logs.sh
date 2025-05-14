#!/usr/bin/env bash

_logs() {
  local option=$1

  case ${option} in
  --bg)
    cd ${WORKING_DIR}
    # do we really need rp-all here?
    $DOCKER_COMPOSE up --build -d rp-all log-hub
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