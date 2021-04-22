# France Connect - Stack de développement Docker

Voir readme en ligne : https://gitlab.dev-franceconnect.fr/france-connect/documentation/-/wikis/Infrastructure/Proc%C3%A9dures/Stack-de-d%C3%A9veloppement-locale

# Structure de la stack

:warning: A l'heure actuelle, la structure des docker n'est pas encore identique à la documentation qui suit. Le but est de tendre, ticket après ticket, vers cette structure.

## Executable: docker-stack

L'executable "docker-stack" est un utilitaire simplifiant les opérations quotidiennes sur la manipulation des différents environnements (FranceConnect / AgentConnect / eIDAS).

Il permet:

- D'installer la stack locale et les dépendances
- De lancer une ou plusieurs instances
- De réinitialiser une ou plusieurs instances
- De simplifier la configuration et le lancement des pipelines de CI
- D'accèder aux logs des différents conteneurs

Afin de réaliser ces tâches tout en conservant une bonne lisibilité. Il fait appel à des sous-utilitaires pour par exemple manipuler les conteneurs mongo.

## Dossier: compose

Ce dossier contient l'ensemble des fichiers docker-compose et environnements nécessaires à la gestion de la stack de dev. Ces éléments s'organisent de la façon suivante:

```
compose/
  shared/ -> contient les docker-composes et environnements partagés par toutes les stack (proxys, rnipp-mock, ...)
    .env/
      base-env.env -> contient l'environnement de base nécessaire à toute app NodeJS
  stack-name/
    .env/
      service-1.env
      service-2.env
    service-1.yml
    service-2.yml
    stack.yml -> contient les groupements d'applications pouvant se lancer ensemble
```

## Dossier: volumes

```
volumes/
  shared/
    shared-service/
      ...
  stack-name
    service-1/
      ...
    service-2/
      ...
```
