#!/bin/sh

test $(mongosh --host ${HOSTNAME} -u ${MONGO_INITDB_ROOT_USERNAME} -p ${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase admin ${MONGO_INITDB_DATABASE} --quiet --tls --tlsCAFile /usr/local/share/ca-certificates/docker-stack-ca.crt --eval "rs.initiate().ok || rs.status().ok") -eq 1
