#!/usr/bin/env bash

_checkout() {
  if [ -z "${FC_ROOT}"  ]
  then
    echo ""
    echo "Unable to find your root directory, please make sure \"FC_ROOT\" is defined."
    exit 1
  fi

  branch_code=${1:-empty}
  branch_infra=${2:-staging}

  case $branch_code in
    empty)
      echo "Usage: docker-stack checkout <code:branch/tag> [infra:branch/tag]"
      exit 1
      ;;
    *)
      cd "${FC_ROOT}/FranceConnect"

      local exist=`git ls-remote . ${branch_code} | wc -l`
      if [ ${exist} -lt 1 ]; then
        echo "The code branch \"${branch_code}\" does not exist or hasn't been fetched"
        exit 1
      fi

      git checkout ${branch_code} || exit $?

      git pull origin || exit $?

      cd ${WORKING_DIR}

      ./docker-stack reset-db || exit $?

      ./docker-stack reload-all

      cat "$INCLUDE_DIR/txt/saitama.art.txt"
      ;;
  esac
}