#!/usr/bin/env bash
set -e

if [ -z "$FC_ROOT"  ]
then
  read -p "Missing FC_ROOT path. Please fill in: " FC_ROOT
  exit 1;
fi

__DKS_LAST_LOG_FILE="/tmp/docker_stack_last.log"

INCLUDE_DIR="$FC_ROOT/fc/docker/bash"


source "$INCLUDE_DIR/utils.sh"
source "$INCLUDE_DIR/config.sh"
source "$INCLUDE_DIR/docker.sh"
source "$INCLUDE_DIR/elastic.sh"
source "$INCLUDE_DIR/fca-tmp.sh"
source "$INCLUDE_DIR/node.sh"
source "$INCLUDE_DIR/postgres.sh"
source "$INCLUDE_DIR/test.sh"
source "$INCLUDE_DIR/up.sh"

script=$0
action=${1:-help}
[ $# -gt 0 ] && shift
case "$action" in
  checkout)
    _checkout $@
    ;;
  dep|dependencies)
    _install_dependencies $@
    ;;
  dep-all|dependencies-all)
    _get_running_containers
    _install_dependencies $NODEJS_CONTAINERS
    ;;
  exec)
    _exec $@
    ;;
  halt)
    _halt
    ;;
  log)
    _log $@
    ;;
  llng-configure)
    cd ${WORKING_DIR} && docker-compose exec fia-llng-low bash /scripts/init.sh
    ;;
  compose)
    cd ${WORKING_DIR} && docker-compose $@
    ;;
  log-rotate)
    echo "Send SIGUSR2 to core-fcp-high app..."
    cd ${WORKING_DIR} && docker-compose exec core-fcp-high pkill -SIGUSR2 -f '/usr/bin/node -r source-map-support/register --inspect=0.0.0.0:9235 /var/www/app/dist/instances/core-fcp-high/main'
    echo "... Signal done"
    ;;
  fixtures-fcp-high)
    _fixtures_fcp_high
    ;;
  fixtures-fca-low)
    _fixtures_fca_low
    ;;
  fca-low-front)
    _fca_low_front
    ;;
  # Unique command to keep
  mongo)
    _mongo_shell $@
    ;;
  mongo-shell-core-fca-low)
    _mongo_shell_core_fca_low
    ;;
  mongo-shell-core-fcp-high)
    _mongo_shell_core-fcp-high
    ;;
  mongo-shell-core-fcp-low)
    _mongo_shell_core-fcp-low
    ;;  
  mongo-shell-core-legacy)
    _mongo_shell_core-legacy
    ;;
  reload-rp)
    cd ${WORKING_DIR} && docker-compose kill -s SIGHUP rp-all
    ;;
  reload)
    _start $@
    ;;
  reload-all)
    _get_running_containers
    _start $NODEJS_CONTAINERS
    ;;
  init-ud)
    _init_ud
  ;;
  reset-stats)
    _reset_stats
    ;;
  generate-stats)
    _generate_stats
    ;;
  generate-events)
    _generate_events
    ;;
  generate_legacy_traces)
    _generate_legacy_traces
    ;;
  generate_v2_traces)
    _generate_v2_traces
    ;;
  generate-metrics)
    _generate_metrics
    ;;
  delete-indexes)
   _delete_indexes
    ;;
  es-create-ingest-pipeline)
    _create_es_ingest_pipeline
    ;;
  restore-snapshot)
    _es_restore_snapshot
    ;;
  reset-db-core-fcp-high)
    _reset_db_fcp_high $@
    ;;
  reset-db-core-fcp-low)
    _reset_db_fcp_low $@
    ;;
  reset-db-core-fca-low)
    _reset_db_core_fca_low $@
    ;;
  reset-db-legacy)
    _reset_db_legacy $@
    ;;
  idp-as-prod-v2)
    _idp_as_prod_v2 $@
    ;;
  idp-as-prod-legacy)
    _idp_as_prod_legacy $@
    ;;
  start)
    _start $@
    ;;
  start-ci)
    _start_ci $@
    ;;
  stop)
    _stop $@
    ;;
  # -- start all up's containers (FCP and/or FCA)
  start-all)
    _get_running_containers
    _start $NODEJS_CONTAINERS
    ;;
  # -- stop all up's containers (FCP and/or FCA)
  stop-all)
    _get_running_containers
    _stop $NODEJS_CONTAINERS
    ;;
  test)
    _test $@
    ;;
  test-all)
    _get_running_containers
    _test $NODEJS_CONTAINERS
    ;;
  e2e)
    _e2e $@
    ;;
  migrations-partners-fcp)
    _migrations-partners "partners-fcp-back"
    ;;
  migrations-partners-fca)
    _migrations-partners "partners-fca-back"
    ;;
  migrations-generate-partners-fcp)
    _migrations-generate-partners "partners-fcp-back" $@
    ;;
  migrations-generate-partners-fca)
    _migrations-generate-partners "partners-fca-back" $@
    ;;
  fixtures-partners-fcp)
    _fixtures-partners "partners-fcp-back"
    ;;
  fixtures-partners-fca)
    _fixtures-partners "partners-fca-back"
    ;;
  init)
    _init-fcapps $@
    ;;
  storybook)
    _storybook
    ;;
  prune)
    _halt
    docker network prune -f && docker container prune -f
    ;;
  prune-all)
    cat ./txt/atomic.art.txt
    _halt
    docker system prune -af && docker image prune -af && docker system prune -af --volumes && docker system df && (cypress cache prune || echo "skipped cypress cache prune") && npm cache clean --force && yarn cache clean && sudo du -sh /var/cache/apt/archives && cd ${FC_ROOT} && find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
    ;;
  up)
    _up $@
    ;;
  run-prod)
    _run_prod $@
    ;;
  help)
    cat $INCLUDE_DIR/txt/usage.txt
    exit 1
    ;;
  *)
    cd ${WORKING_DIR} && docker-compose $action $@
    ;;
esac
