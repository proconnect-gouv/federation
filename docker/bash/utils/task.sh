#!/usr/bin/env bash

task() {
  if [ -z $VERBOSE ]
  then
    echo -ne "$1: "
    (`$2 &> "$__DKS_LAST_LOG_FILE"` && _task_success $"1") || _task_fail "$1" "$2"
  else
    $2
  fi
}

_task_success() {
    echo $(format_success "OK")
}

_task_fail() {
    echo $(format_failure "Failed")
    echo "   - command: > $1"
    echo "   - result:"
    echo " -------------------------------- "
    cat "$__DKS_LAST_LOG_FILE"
    echo " -------------------------------- "
    echo -e " * $1: $KO";
    exit 1;
}