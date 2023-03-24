#!/usr/bin/env bash


# Find which nodejs containers are running and store it into $RUNNING_CONTAINERS
_get_running_containers() {
  local RAW_NODEJS_CONTAINERS=`docker ps --format '{{.Names}}' -f ancestor=$FC_DOCKER_REGISTRY/nodejs:$NODE_VERSION-dev`
  local RAW_ALL_CONTAINERS=`docker ps --format '{{.Names}}'`

  NODEJS_CONTAINERS=$(_container-to-compose-name "$RAW_NODEJS_CONTAINERS")
  FC_CONTAINERS=$(_container-to-compose-name "$RAW_ALL_CONTAINERS")
}


_container-to-compose-name() {
  local INPUT=$1
  local OUTPUT=""

  for container in $INPUT
  do
    local name=$(echo $container| sed -E 's/^fc_(.*)_1$/\1/')
    OUTPUT=$(echo -e "$OUTPUT\n$name")
  done

  echo $OUTPUT
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
