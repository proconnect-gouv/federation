#!/usr/bin/env bash

_reset_db_fcp_high() {
  echo "Reseting Core FCP High mongo database..."
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY mongo-fcp-high /opt/scripts/manage.sh --reset-db
}

_reset_db_fcp_low() {
  echo "Reseting Core FCP low mongo database..."
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY mongo-fcp-low /opt/scripts/manage.sh --reset-db
}

_reset_db_legacy() {
  echo "Reseting Core FCP low mongo database..."
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY mongo-legacy /opt/scripts/manage.sh --reset-db
}

_reset_db_core_fca_low() {
  echo "Reseting Core FCA LOW mongo database..."
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY mongo-fca-low /opt/scripts/manage.sh --reset-db
}

_idp_as_prod_v2() {
  echo "Set IdP as production ..."
  cd ${WORKING_DIR} && docker-compose exec $NO_TTY mongo-fcp-high /opt/scripts/manage.sh --reset-db=display-idp-as-in-prod
}

_mongo_shell_core_fca_low() {
 echo "starting mongo `core-fca-low` database in shell..."
  cd ${WORKING_DIR} && docker-compose exec mongo-fca-low mongo -u 'rootAdmin' -p 'pass' --authenticationDatabase admin core-fca-low --tls
}

_mongo_shell_core-fcp-high() {
 echo "starting mongo `core-fcp-high` database in shell..."
  cd ${WORKING_DIR} && docker-compose exec mongo-fcp-high mongo core-fcp-high -u 'fc' -p 'pass' --authenticationDatabase core-fcp-high --tls
}

_mongo_shell_core-fcp-low() {
 echo "starting mongo `core-fcp-low` database in shell..."
  cd ${WORKING_DIR} && docker-compose exec mongo-fcp-low mongo core-fcp-low -u 'core-fcp-low' -p 'pass' --authenticationDatabase core-fcp-low --tls
}
_mongo_shell_core-legacy() {
 echo "starting mongo `core-legacy` database in shell..."
  cd ${WORKING_DIR} && docker-compose exec mongo-legacy mongo core-legacy -u 'core-legacy' -p 'pass' --authenticationDatabase core-legacy --tls
}
