# long

## Situation

La lib apache-ignite-client pointe sur la lib "long" avec une dépendance fixée à "latest".
Une version 5.0.0 vient d'être publiée par "long" mais celle ci pose des problèmes à la compilation des tests.
En effet, les développeurs ont mis en place les ESM: https://github.com/dcodeIO/long.js/commit/86410397c36ad64aa6c9a45293bff918ce0ea14d

## Contre mesures

Mise en place d'un "resolve" à "4.0.0" pour la lib long en attendant de pouvoir bien comprendre le problème et le résoudre.
