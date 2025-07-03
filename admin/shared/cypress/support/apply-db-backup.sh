#!/bin/bash

psql postgres -U pg-user -c 'REVOKE CONNECT ON DATABASE "pg-db" FROM public'
psql postgres -U pg-user -c "SELECT \"pid\", pg_terminate_backend(pid) FROM \"pg_stat_activity\" WHERE datname='pg-db' AND pid <> pg_backend_pid();"
psql postgres -U pg-user -c 'DROP DATABASE  IF EXISTS "pg-db"'
psql postgres -U pg-user -c 'CREATE DATABASE "pg-db" WITH TEMPLATE "pg-backup"'
