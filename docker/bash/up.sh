#!/usr/bin/env bash

source "$INCLUDE_DIR/mongo.sh"
source "$INCLUDE_DIR/docker.sh"
source "$INCLUDE_DIR/utils.sh"

_up() {
  task "Checking required services"\
  "_check_for_unknown_services $@"
  
  echo " * Starting services... [$@]"

  task "Pulling fresh node image"\
  "_pull_node_image"

  task "Up containers"\
  "_do_up $@"

  task "Populate global variables"
  "_get_running_containers"

  task "Automatically install dependencies for started containers"\
  "_auto_install_dependencies"

  echo " * Automatically run init scripts for started containers"
  _auto_init_containers
}

_do_up() {
  # Get wanted services
  local services=$(_get_services "$@")

  cd ${WORKING_DIR} 
  docker-compose up --build -d $services 
}

_check_for_unknown_services() {
  local asked=$(_get_services "$@")
  local available=$(_list_services)

  for service in $asked
  do
    match=$(echo "$available" | grep "^$service$" | wc -l)
    if [ "$match" != "1" ]
    then
      echo "Service / Stack Not Found: $service";
      exit 1;
    fi
  done
}


_get_services() {
  apps=${@:-none}
  services=rp-all

  for app in $apps
  do
    services="$services $app"
  done

  echo $services
}

_auto_install_dependencies() {
  if [ "${_ONLY_NODEJS_NON_LEGACY_RUNNING_CONTAINERS:-xxx}" != "xxx" ]
  then
    echo "Installing node modules..."
    _install_dependencies $_ONLY_NODEJS_NON_LEGACY_RUNNING_CONTAINERS
  fi
}

_auto_init_containers() {

  for app in $FC_CONTAINERS
  do
    task " * init \e[3m${app}\e[0m " "_init_container $app"
  done
}

_init_container() {
  APP=$1

  case $APP in
    *"lemon-ldap"*)
      # Sleep to wait for configuration initialization
      echo "Restore LemonLDAP configuration"
      cd ${WORKING_DIR} && docker-compose exec fia-llng-low bash /scripts/init.sh
      echo "Loaded !"
      ;;
    *"mongo-legacy"*)
      # Sleep to wait for mongodb replicat initialization
      sleep 10
      _reset_mongodb "mongo-legacy"
      # TMP to keep compatibility with CL E2E
      _idp_as_prod_legacy
      ;;
    *"mongo-fca-low"*)
      # Sleep to wait for mongodb replicat initialization
      sleep 10
      _reset_mongodb "mongo-fca-low"
      ;;
    *"mongo-fcp-low"*)
      # Sleep to wait for mongodb replicat initialization
      sleep 10
      _reset_mongodb "mongo-fcp-low"
      ;;
    *"mongo-fcp-high"*)
      # Sleep to wait for mongodb replicat initialization
      sleep 10
      _reset_mongodb "mongo-fcp-high"
      ;;
    *"mongo-partenaires"*)
      _reset_mongodb "mongo-partenaires"
      ;;
    *"pg-fc-exploitation"*)
      _init-fcapps "fc-exploitation"
      ;;    
    *"pg-fc-support"*)
      _init-fcapps "fc-support"
      ;;
    *"partners-fca-back"*)
      echo "Running migrations on database..."
      _migrations-partners "partners-fca-back"
      echo "Inserting fixtures in database..."
      _fixtures-partners "partners-fca-back"
      ;;
    *"partners-fcp-back"*)
      echo "Running migrations on database..."
      _migrations-partners "partners-fcp-back"
      echo "Inserting fixtures in database..."
      _fixtures-partners "partners-fcp-back"
      ;;
    *"elasticsearch"*)
      # Waiting for ES to be up
      sleep 15
      echo "Initialize user-dashboard data..."
      _init_ud
      ;;
  esac
}

