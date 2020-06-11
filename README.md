# FC Core v2

Core & backoffice applications v2

## Installation

## Sécurité

### Faux positif checkmarx

#### bluebird

##### Situation

Checkmarx renvoi une alerte sur l'utilisation de la librairie bluebird, qui présenterait un risque de memory leak :


> The package `bluebird` is vulnerable to memory leak, when running the function longStackTraces() with the flag `--expose_gc`. This causes a significant increase in the memory usage, affecting the server's availability. [Cxda14f253-4e52](https://github.com/petkaantonov/bluebird/issues/1080)

Dans les faits, le risque est documenté mais est lié à un mauvais usage de la librairie, voir [ici](https://github.com/petkaantonov/bluebird/issues/1445) et [là](https://github.com/petkaantonov/bluebird/issues/1446).

La fonction concernée sert à faire du debug et est automatiquement activée dans les cas suivants :

- Environnement de développement (`NODE_ENV=development`)
- Si la variable d'environnement `BLUEBIRD_DEBUG` est définie et n'est pas "falsy" (comparaison : `!= 0`).
- Si la variable d'environnement `BLUEBIRD_LONG_STACK_TRACES` est définie et n'est pas "falsy" (comparaison : `!= 0`).

Il y a en outre une confusion dans la communauté, pour l'utilisation côté browser, dans ce cas la version minifiée de la librairie désactive les fonctions de debug tandis que la version non minifié les active. Nous ne sommes pas concernés par ces problématiques.

La librairie est une dépendance de plusieurs autres dépendances, on ne peut pas s'en passer simplement.

##### Contre mesures

Nous utilisons les variables d'environnement suivantes pour désactiver explicitement l'utilisation de la fonctionnalité :

```
BLUEBIRD_LONG_STACK_TRACES=0
BLUEBIRD_DEBUG=0
```

Ajouté à la variable `NODE_ENV=production` on est assuré que la fonction incriminée n'est pas activée.

Voir [la documentation](http://bluebirdjs.com/docs/api/promise.config.html#promise.config) et [le code source](https://github.com/petkaantonov/bluebird/blob/master/src/debuggability.js#L20) de la lib.

## Mise en place des données

## Etc/hosts

## Variables d'env
