#!/usr/bin/env bash

source "$INCLUDE_DIR/elastic.sh"
source "$INCLUDE_DIR/mongo.sh"
source "$INCLUDE_DIR/postgres.sh"

# Container initialisation hooks
#
# This runs arbitrary code if a container is started
# matching on the container name
# 
# Hooks are called in the `docker-stack up <stack>` command,
# after all other automatic procedures.
# Nodejs dependencies are already installed at this stage
function _init_hooks() {

  local container=$1

  case $container in
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
    *"pg-exploitation"*)
      _init-fcapps "fc-exploitation"
      ;;    
    *"pg-support"*)
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
    *)
      # Erase line content for containers that don't have an init section
      # This way we only display task for containers that have actually done something
      # Note that number of space characters is arbitrary but should work in most cases
      _task_result "\r                                                                 \r"
      ;;
  esac
}
