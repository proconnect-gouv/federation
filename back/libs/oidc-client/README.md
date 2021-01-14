# OIDC Client



## Routes exposées


### POST /redirect-to-idp

### GET /oidc-callback

### GET /client/.wellknown/keys


## À propos


Cette libraire sert à encapsuler la libraire tierce [node-openid-client](https://github.com/panva/node-openid-client).



## Recettes

### Désactiver le chiffrement des `userinfo`

Dans la configuration du client oidc, s'assurer de ne pas préciser d'algorithme et d'encodage de chiffrement (une chaîne vide fait l'affaire si on est obligé de passer le paramètre) 
