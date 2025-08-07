#!/bin/bash

psql postgres -U pg-user -c 'REVOKE CONNECT ON DATABASE "pg-backup" FROM public'
psql postgres -U pg-user -c "SELECT \"pid\", pg_terminate_backend(pid) FROM \"pg_stat_activity\" WHERE datname='pg-backup' AND pid <> pg_backend_pid();"
psql postgres -U pg-user -c 'DROP DATABASE  IF EXISTS "pg-backup"'
psql postgres -U pg-user -c 'CREATE DATABASE "pg-backup" WITH TEMPLATE "pg-db"'
