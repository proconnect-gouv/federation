---
key: fs-projet-eidas-noeud
title: Comment donner accès à mon service à des usagers des autres états membres ?
layout: layouts/page.doc.njk
tags:
  - FranceConnect+
  - eIDAS
segments:
  [
    { url: '/fs/', title: 'Fournisseurs de services' },
    { url: '/fs/projet/', title: 'Intégration de FranceConnect ou FranceConnect+ à mon service' },
  ]
category: fs-projet
abstract: "Il est possible de donner accès à son service à des usagers des autres états membres au travers de FranceConnect+ et le noeud d'interropérabilité eIDAS français"
seealso:
  - fs-eidas-loa
  - fs-projet-eidas-cinematique
---

Vous souhaitez donner accès à votre service à des usagers des autres états membre. Cela est possible en utilisant FranceConnect+ et le noeud d'interopérabilité eIDAS français.

### Quel est l'objectif du noeud d'interopérabilité eIDAS ?

Dans le cadre du règlement eIDAS, chaque état membre met à disposition un noeud d'intéropérabilité eIDAS qui permet à tout citoyen européen d'accéder à des fournisseurs de service d'un autre état membre en utilisant un schéma d'identification d'un autre état membre.

Au niveau de la France, le noeud d'intéropérabilité est opéré par la DINUM au même titre que FranceConnect+.

Il est donc possible pour des fournisseurs de service, d'authentifier et d'identifier les usagers des autres états membres avec les fournisseurs d'identités mis à disposition par leur état membre.

Ainsi, les usagers des autres états membres peuvent accéder à votre service en utilisant le fournisseur d'identité qu'ils utilisent habituellement dans leur pays.

### Quels sont les niveaux de garantie accessible via les schémas d'identification des autres états membre ?

Les niveaux de garanties utilisables via les schémas d'idenitification des autres états membre sont les niveaux substantiels et élevés. Il n'est pas possible de demandés ou d'obtenir des identités de niveau de garantie faible via les schémas d'identification des autres états membres.

### Comment un fournisseur de service peut utiliser le noeud d'interopérabilité eIDAS français ?

L'accès au noeud d'interoperabilité se fait au travers de FranceConnect+. Pour y avoir accès, il est nécessaire d'en faire la demande auprès de l'équipe FranceConnect. Par défaut, celui-ci n'est pas disponible.

## Quel est le parcours d'un usager d'un autre état membre pour accéder à mon service ?

Le point de départ est le même que pour les autres usagers, il est nécessaire de cliquer sur le bouton FranceConnect+ disponible sur votre service.

Une fois sur la page de sélection du fournisseur d'identité, un bouton _Sign in with a digital identity from another european country_ permet à l'usager d'indiquer qu'il souhaite utiliser le schéma d'identification d'un autre état membre.

Le parcours de l'usager se déroule suivant les étapes suivante

1. L'usager clique sur un bouton dédié sur la page de donnexion du fournisseur de service
1. L'usager selectionne son pays
1. L'usager s'authentifie une identité numérique proposé par le pays qu'il a sélectionné
1. L'usager confirme qu'il souhaite bien continuer vers sa démarche
1. L'usager est authentifié auprès de son service

#### 1. L'usager clique sur un bouton dédié sur la page de donnexion du fournisseur de service

Pour permettre aux usagers des autres états membre d'accéder à votre service ou démarche en ligne, il est nécessaire de placer à coté du bouton FranceConnect ou FranceConnect+ un bouton dédié, permettant à ces derniers d'identifier clairement qu'ils ont la possibilité de s'authentifier en utilisant leur identité numérique mise à disposition par leur état.

<div class="fr-grid-row fr-grid-row--gutters fr-mb-3w">
    <div class="fr-col-6">

![Boutons FranceConnect+ et eIDAS sur la page de connexion du fournisseur de service](/images/fs/fs-fc-plus-eidas.png)

    </div>
    <div class="fr-col-6">

![Boutons FranceConnect+ et eIDAS sur la page de connexion du fournisseur de service](/images/fs/fs-fc-plus-eidas.png)
</div>

</div>

#### 2. L'usager sélectionne son pays

Une fois que l'usager a cliqué sur le bouton, il est redirigé sur une page lui permettant de sélection son pays.

<div class="fr-grid-row fr-grid-row--gutters fr-mb-3w">
    <div class="fr-col-9">

<img src="/images/fs/fc-eidas-selection-pays.png" alt="Page de selection du pays" width="100%"/>

    </div>

</div>

### Les données d'identités d'un usager d'un autre état membre sont elles les mêmes que celles que je récupère habituellement ?
