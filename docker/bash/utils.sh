#!/usr/bin/env bash

#### Global Functions:

function join_by { local IFS="$1"; shift; echo "$*"; }

OK="\e[1;36mOK\e[0;0m"
KO="\e[1;41m Failed \e[0;0m"

task() {
  if [ -z $VERBOSE ]
  then
    echo -ne " * $1: "
    (`$2 &> "$__DKS_LAST_LOG_FILE"` && _task_success $"1") || _task_fail "$1" "$2"
  else
    $2
  fi
}

_task_success() {
    echo -e $OK
}

_task_fail() {
    echo -e $KO
    echo "   - command: > $1"
    echo "   - result:"
    echo " -------------------------------- "
    cat "$__DKS_LAST_LOG_FILE"
    echo " -------------------------------- "
    echo -e " * $1: $KO";
    exit 1;
}


wait_for_nodejs() {

  local CONTAINER=$1
  local URL=$2
  local MAX_TIME=${3:-60}
  local DELAY=${4:-5}
  local MAX_RETRIES=${5:-100}

  echo "Waiting for $CONTAINER on URL: $URL"

  (curl\
    --silent\
    --insecure\
    --fail\
    --retry $MAX_RETRIES\
    --retry-delay $DELAY\
    --retry-max-time $MAX_TIME $URL\
    > /dev/null\
    && _wait_for_nodejs_success "$CONTAINER"\
  )\
  || _wait_for_nodejs_fail "$CONTAINER"

}

_wait_for_nodejs_fail() {
  echo -e "$KO Service DOWN: $1"
  echo ""
  echo "--- PM2 Logs for $1 ---------------------------"
  docker exec "fc_${1}_1" bash -c 'cat /tmp/.pm2/logs/*.log'
  echo "--- END OF PM2 Logs for $1 --------------------"
  echo ""
  exit 1
}

_wait_for_nodejs_success() {
  echo -e "$OK Service UP: $1"
}