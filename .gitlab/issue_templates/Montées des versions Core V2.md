# Description du besoin 

Afin d'assurer la maintenabilité du projet et de le protéger contre les éventuelles failles qui peuvent apparaître, il est important de régulièrement procéder à la mise à jour des dépendances.

# Situation Actuelle

Lorsque ce ticket récurrent arrive en tête de liste des TODO, certaines dépendances ne sont probablement pas à jour.

# Actions

Sur chaque projet dev, jouer les commandes:
* [ ] `yarn upgrade` (ne met à jour que les versions mineures)
* [ ] `yarn outdated`. Mettre à jour au moins les oranges, si possible les rouges (bien regarder quels sont les breaking changes). Pour cela mettre à jour les versions du package.json
* [ ] `yarn install`
* [ ] Passer les tests unitaires et E2E
* [ ] `yarn audit`. S'il reste des failles, voir pour créer des tickets pour les traiter.
* [ ] Commit le fichier yarn.lock
* [ ] S'il reste des montées de version avec des breaking changes, voir pour créer les tickets pour les mettre à jour. Un ticket par package.

:warning: **JOSE + OIDC-PROVIDER**
* [ ] Vérifier la version courante de [`jose`](https://github.com/panva/jose) dans `oidc-provider`, s'il y a une montée de version, faire également la montée de version dans notre `package.json`. Voir les [impacts du changement de version](https://github.com/panva/jose/releases) sur nos overrides. Contrôler la version : 
   * [ ] Dans la section `dependencies`
   * [ ] Dans la section `resolutions`


# Recette

## TA01 - Vérifier les mises à jour sur chaque projet

1. `yarn outdated` -> il ne reste que des rouges, les tickets de maj sont créés en draft
2. `yarn audit` -> les failles sont documentées ou ticketées pour être résolues
3. La CI passe tous les tests et les couvertures de tests ne baissent pas



/weight 3
/label ~"timebox::1j"
/label ~"typechangement::normal-mineur" ~"♻️ Recurring"
/label ~"Core V2"
