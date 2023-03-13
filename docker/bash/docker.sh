#!/usr/bin/env bash


# Find which nodejs containers are running and store it into $RUNNING_CONTAINERS
_get_running_containers() {
  NODEJS_CONTAINERS=`docker ps -qf ancestor=$FC_DOCKER_REGISTRY/nodejs:$NODE_VERSION-dev`

  if [ "${NODEJS_CONTAINERS:-xxx}" != "xxx" ]
  then
    RUNNING_CONTAINERS=`docker inspect -f '{{index (.Config.Labels) "com.docker.compose.service" }}' $NODEJS_CONTAINERS`

    # Quick dirty trick to not match any legacy container in CI
    # This will get all running containers ($RUNNING_CONTAINERS) and match them against the container list from docker-compose (which is for sure not containing legacy containers)
    # Objective is to use the $COMPOSE_PROJECT_NAME later.
    _ONLY_NODEJS_NON_LEGACY_RUNNING_CONTAINERS=`comm -12 <(docker-compose ps --services --filter "status=running" | sort) <(echo $RUNNING_CONTAINERS | tr ' ' '\n' | sort)`
  fi
}


_halt() {
  echo "Stopping FC Dev environment..."
  cd ${WORKING_DIR} && docker-compose stop
}

_exec() {
  app=${1:-empty}
[ $# -gt 0 ] && shift

  case $app in
    empty)
      echo "Usage: docker-stack exec <container_name> <command>"
      exit 1
      ;;
    *)
      cd ${WORKING_DIR} && docker-compose exec $NO_TTY $app $@
      ;;
  esac
}
