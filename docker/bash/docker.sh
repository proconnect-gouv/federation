#!/usr/bin/env bash


# Find which nodejs containers are running and store it into $RUNNING_CONTAINERS
_get_running_containers() {
  NODEJS_CONTAINERS=`docker ps -qf ancestor=$FC_DOCKER_REGISTRY/nodejs:$NODE_VERSION-dev`

  FC_CONTAINERS=`$0 ps --services --filter=status=running | grep -vE "(tmpdir|rp-all|docker-gen)"`

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
      cd $WORKING_DIR
      docker-compose exec $NO_TTY $app $@
      ;;
  esac
}

_list_services() {
  docker-compose ps --services
}

_pull_node_image() {
  local URI="registry.gitlab.dev-franceconnect.fr/france-connect/fc-docker/nodejs:$DEFAULT_NODE_VERSION-dev"
  docker login $FC_DOCKER_REGISTRY
  docker pull $URI
  # (docker login $FC_DOCKER_REGISTRY && docker pull $URI) || echo "Could not fetch fresh nodejs Image, not connected to the Internet?"
}
<<<<<<< HEAD
=======

_prune() {
  _halt
  docker network prune -f
  docker container prune -f
}

_prune_all() {
  cat "$INCLUDE_DIR/txt/atomic.art.txt"
  _halt
  docker system prune -af
  docker image prune -af
  docker system prune -af --volumes
  docker system df
  (cypress cache prune || echo "skipped cypress cache prune")
  npm cache clean --force
  yarn cache clean
  sudo du -sh /var/cache/apt/archives
  cd $FC_ROOT
  find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
}
>>>>>>> 76e425bd0... fixup! [POC-1225]🔧 Update tooling
