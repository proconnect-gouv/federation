# Oidc Provider


## À propos


Cette libraire sert à encapsuler la libraire tierce [node-oidc-provider](https://github.com/panva/node-oidc-provider).



## Recettes

### Désactiver le chiffrement des `userinfo`

1. Dans la [configuration de la librairie](src/dto/oidc-provider-config.dto.ts), désactiver la `feature` _encryption_.
1. Dans les configuration des clients, s'assurer de ne pas préciser d'algorithme et d'encodage de chiffrement (une chaîne vide fait l'affaire) 