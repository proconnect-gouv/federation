---
key: fs-pilotage-isolation-fi-fs
title: Puis je connaitre le fournisseur d'identité utilisé par mes usagers ?
layout: layouts/page.doc.njk
tags:
  - FranceConnect
  - FranceConnect+
segments:
  [
    { url: '/fs/', title: 'Fournisseurs de services' },
    { url: '/fs/pilotage', title: 'Fonctionnement général de FranceConnect et FranceConnect+' },
  ]
category: fs-pilotage
abstract: Il n'est pas possible de connaitre, pour un usager, le fournisseur d'identité utilisé lors de sa connexion conformément à la recommendation de la CNIL de juillet 2016. Il est cependant possible d'avoir des statistiques permettant de connaitre les fournisseurs d'identités utilisés par les usagers.
seealso:
  - fs-pilotage-fi
---

## Isolation entre fournisseur d'identité et fournisseur de service

Conformément à l'avis de la [CNIL de juillet 2015](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000030973293), il ne doit pas être possible pour un fournisseur de service d'identifié le fournisseur d'identité utilisé par un usager pour accéder à son service. Réciproquement, il ne doit pas être possible pour un fournisseur d'identité de connaitre les fournisseurs de service auxquels accèdent un usager.

Il n'est donc pas possible pour un fournisseur de service de récupérer des informations permettant d'identifier le fournisseur d'identité utilisé lors de l'accès d'un usager à son service.

## Répartition des connexions par fournisseurs d'identité

Bien qu'il ne soit pas possible de connaitre le fournisseur d'identité utilisé par un usager lors de l'accès à son service, il est tout de même possible de connaitre des données agrégées, à partir du moment qu'il n'est pas possible d'identifier les accès d'un usager.

Ainsi, il est possible de connaitre la répartition des connexions auprès de son fournisseur de service via FranceConnect ou FranceConnect.
Cette répartition des connexions est accessible sur l'espace partenaire pour les fournisseurs de service en disposant ou en faisant la demande auprès de l'équipe FranceConnect.

::: callout En bref

Il n'est pas possible de connaitre, pour un usager, le fournisseur d'identité utilisé lors de sa connexion conformément à la recommendation de la CNIL de juillet 2016. Il est cependant possible d'avoir des statistiques permettant de connaitre les fournisseurs d'identités utilisés par les usagers.

:::
