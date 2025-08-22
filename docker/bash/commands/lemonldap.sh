#!/usr/bin/env bash

function _llng_configure() {
  cd ${WORKING_DIR}
  $DOCKER_COMPOSE exec identity-provider-llng bash /scripts/init.sh
}
