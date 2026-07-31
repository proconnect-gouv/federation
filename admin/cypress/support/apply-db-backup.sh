#!/bin/bash

psql -U pg-user -d pg-db -c 'TRUNCATE TABLE "user", "password", "authentication_failures"'
psql -U pg-user -d pg-db -f /tmp/admin-e2e-seed.sql
