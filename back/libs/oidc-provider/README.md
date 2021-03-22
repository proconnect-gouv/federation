# Oidc Provider

## À propos

Cette libraire sert à encapsuler la libraire tierce [node-oidc-provider](https://github.com/panva/node-oidc-provider).

## Recettes

### Désactiver le chiffrement des `userinfo`

1. Dans la [configuration de la librairie](src/dto/oidc-provider-config.dto.ts), désactiver la `feature` _encryption_.
1. Dans les configuration des clients, s'assurer de ne pas préciser d'algorithme et d'encodage de chiffrement (une chaîne vide fait l'affaire)

## Découpage fonctionnel

Les parties relative à la gestion des erreurs et à la configuration on été déplacées respectivement dans:

- `./services/oidc-provider-error.service.ts`
- `./services/oidc-provider-config.service.ts`

La gestion des différents middlewares étant une partie métier, ces derniers ont été déplacés dans le `/lib/core/core.service.ts` à l'intérieur de la librairie core.
