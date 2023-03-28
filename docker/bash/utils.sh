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
