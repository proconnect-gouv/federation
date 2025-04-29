#!/usr/bin/env bash
NODE_VERSION=v22.13.0
export  NODE_VERSION

DOCKER_COMPOSE="docker compose"

_up() {
  echo " * Checking required services"
  local asked=$(_get_services "$@")
  local available=$(_list_services)

  for service in $asked; do
   declare -i match=$(echo "$available" | grep "^$service$" | wc -l)

    if [ $match -eq 0 ]; then
      echo "Service / Stack Not Found: $service"
      exit 1
    fi
  done

  echo " * Starting services: $(format_emphasis $(join_by ", " "${@}"))"

  task " * Build fresh node image" \
    "_build_node_image"

  echo "* Build fresh node image"
  docker build -t ${PC_DOCKER_REGISTRY}/nodejs:${NODE_VERSION}-dev -f ${PC_ROOT}/federation/docker/builds/node/Dockerfile .

  echo "* Up containers"
  # Get wanted services
  local apps=${@:-none}
  local services=rp-all

  for app in $apps; do
    services="$services $app"
  done

  echo "Services ========>  ${services}"
  # docker compose up services
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE up --build -d $services

  echo " * Populate global variables"
  local raw_nodejs_containers=$(docker ps --format '{{.Names}}' -f ancestor=${FC_DOCKER_REGISTRY}/nodejs:${NODE_VERSION}-dev)
  local raw_all_containers=$(docker ps --format '{{.Names}}')
  NODEJS_CONTAINERS=$(_container_to_compose_name "${raw_nodejs_containers}")
  FC_CONTAINERS=$(_container_to_compose_name "${raw_all_containers}")

  echo " * Automatically install dependencies for started containers"
  if [ "${NODEJS_CONTAINERS:-xxx}" != "xxx" ]; then
    echo "Installing node modules..."
    echo " * Installing dependencies for $(format_emphasis "${NODEJS_CONTAINERS}")"
    _install_dependencies $NODEJS_CONTAINERS
  fi

  echo " * Automatically run init scripts for started containers"
  for app in ${FC_CONTAINERS}; do
    task "   * init $(format_emphasis "${app}")" "_init_hooks" "${app}"
  done
}

_add_node_app() {
  task " * Up containers" \
    "_do_up" "${@}"

  _start "${@}"
}

# still used in logs.sh
_do_up() {
  # Get wanted services

  echo "TEST========>  ${@}"
  local services=$(_get_services "$@")
  echo "Services ========>  ${services}"

  cd ${WORKING_DIR}
  $DOCKER_COMPOSE up --build -d $services
}
