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

### Le double adapter

Dans le cas d'une mise à jour de base de données, le cache de service provider se met à jour.
Ce dernier "prévient" les autres services qu'il est opérationnel et déclenche de fait une mise à jour de la configuration de oidc-provider.
Dans cette optique, oidc-provider doit pouvoir piocher dans ce cache la liste des services providers lorsqu'il l'estime nécessaire par l'intermédiaire d'un adapter.
Il y a deux possibilités pour récupérer l'information:

- soit la liste provient de redis
- soit la liste provient du cache de service provider
  Donc, en fonction du contexte définit par oidc-provider, l'adapter appelera un autre adapter lui fournissant la liste correcte des données
