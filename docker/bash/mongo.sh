#!/usr/bin/env bash


_reset_mongodb() {
  local DB_CONTAINER_NAME=$1
  echo "Reseting database $DB_CONTAINER_NAME to default state..."
  docker-compose exec $NO_TTY $DB_CONTAINER_NAME /opt/scripts/manage.sh --reset-db
}

_idp_as_prod_v2() {
  echo "Set IdP as production ..."
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY mongo-fcp-high /opt/scripts/manage.sh --reset-db=display-idp-as-in-prod
}


_idp_as_prod_legacy() {
  echo "Set IdP as production ..."
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY mongo-legacy /opt/scripts/manage.sh --reset-db=display-idp-as-in-prod
}


_mongo_core_shell() {
  local APP_NAME=$1
  _mongo_shell "mongo-$APP_NAME" "core-$APP_NAME"
}

_mongo_shell() {
  local SERVER=$1
  local DATABASE=$2
  
  echo "starting mongo $SERVER database in shell..."

  docker-compose exec\
    "$SERVER"\
    mongo -u 'rootAdmin' -p 'pass'\
    --authenticationDatabase admin\
    "$DATABASE"\
    --tls
}


# Presets for backward compatibility

_reset_db_legacy() {
  _reset_mongodb "mongo-legacy"
}

_reset_db_fcp_high() {
  _reset_mongodb "mongo-fcp-high"
}

_reset_db_fcp_low() {
  _reset_mongodb "mongo-fcp-low"
}

_reset_db_core_fca_low() {
  _reset_mongodb "mongo-fca-low"
}

_mongo_shell_core_fca_low() {
 _mongo_core_shell "fca-low"
}

_mongo_shell_core-fcp-high() {
 _mongo_core_shell "fcp-high"
}

_mongo_shell_core-fcp-low() {
 _mongo_core_shell "fcp-low"

}
_mongo_shell_core-legacy() {
  _mongo_core_shell "legacy"
}
