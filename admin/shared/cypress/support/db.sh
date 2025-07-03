#!/bin/bash

APP=$1
OPERATION=$2
DIR="$( cd "$( dirname "$0" )" >/dev/null 2>&1 && pwd )"

SQL_RESET_CMD=$(cat "$DIR/$OPERATION"-db-backup.sh);

docker exec pc-pg-"$APP"-1 bash -c "$SQL_RESET_CMD"
