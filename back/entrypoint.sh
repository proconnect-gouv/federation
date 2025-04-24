#!/bin/sh

set -e

if [ "$EMULATE_PM2" = "1" ]; then
  # Emulation du fonctionnement de la lib PM2 :
  #
  # Ce que ça fait :
  # - duplication de la sortie standard vers un fichier nommé /data/log/app/out.log
  # - duplication de la sortie d'erreur vers un fichier nommé /data/log/app/error.log
  #
  # Cette partie a vocation à être supprimée

  exec "$@" \
    > >(tee /data/log/app/out.log) \
    2> >(tee /data/log/app/error.log >&2)
else
  exec "$@"
fi
