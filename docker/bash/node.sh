
#!/usr/bin/env bash

_log() {
  app=${@:-no-container}
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY ${app} pm2 logs
}


_start() {
  apps=${@:-no-container}
  for app in $apps
  do
    echo "Starting ${app} app..."
    cd ${WORKING_DIR} && docker-compose exec $NO_TTY ${app} "/opt/scripts/start.sh" || err=true
  done
}

_stop() {
  apps=${@:-no-container}
  for app in $apps
  do
    echo "Stopping ${app} app..."
    cd ${WORKING_DIR} && docker-compose exec $NO_TTY ${app} "/opt/scripts/stop.sh" || err=true
  done
}

_install_dependencies() {
  apps=${@:-no-container}
  for app in $apps
  do
    echo "Installing dependencies for [$app]:"
    err=false
    if [ "$PROXY_EXPLOITATION" ];
    then
      echo "Setting up yarn proxy for [$app]..."
      cd ${WORKING_DIR} && docker-compose exec $NO_TTY $app bash -c "yarn config set proxy $PROXY_EXPLOITATION && yarn config set https-proxy $PROXY_EXPLOITATION"
    fi
    cd ${WORKING_DIR} && docker-compose exec $NO_TTY $app "/opt/scripts/install.sh" || err=true
  done
}
