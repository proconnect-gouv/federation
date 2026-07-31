#!/bin/bash

## backup is used by db.sh
## Dump lives in the pg-admin container's writable layer — same lifetime as
## the old pg-backup database (gone if the container is recreated without
## re-running docker-stack up's pg-admin hook).
pg_dump -U pg-user -d pg-db --data-only --column-inserts \
  --table='"user"' --table='password' --table='authentication_failures' \
  -f /tmp/admin-e2e-seed.sql
