#!/bin/bash

APP=$1
USERNAME=$2

TOKEN_CMD="psql -x pg-db -U pg-user -c \"SELECT token FROM \\\"user\\\" WHERE username='$2' LIMIT 1;\"";

docker exec pc-pg-"$APP"-1 bash -c "${TOKEN_CMD/'$1'/$USERNAME} | tail -n 2 | head -n 1 | cut -d' ' -f3 | tr -d '\n'";
