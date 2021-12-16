# Problèmes liés aux versions des node_modules

Cette section liste les problèmes liés aux versions des node_modules.

Elle indique les contre-mesures qui ont dû être prises pour pallier les problèmes remontés.

## bluebird

Voir [bluebird](./bluebird.md).

## cookie-signature

Voir [cookie-signature](./cookie-signature.md).

## body-parser

Voir [body-parser](./body-parser.md).

## Faux positifs Checkmarx

En plus des éléments évoqués précédement, les paquets suivants sont détectés comme vulnérables par checkmarx mais ne sont pas réellement problématiques car utilisés uniquement en dépendance de développement.

- marked@1.2.9 (outil de génération de documentation)
- browserslist
- ansi-regex
