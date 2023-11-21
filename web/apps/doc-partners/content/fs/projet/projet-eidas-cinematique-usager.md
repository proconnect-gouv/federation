---
key: fs-projet-eidas-cinematique
title: Quel est le parcours d'un usager d'un autre état membre pour accéder à mon service ?
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
abstract: L'usager doit disposer d'un bouton spécifique sur la page du fournisseur de service, qui lui permettra ensuite de sélectionner son pays pour pouvoir ensuite fournisseur d'identité mise à disposition de son choix.
seealso:
  - fs-eidas-loa
  - fs-projet-eidas-noeud
---

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

#### 3. L'usager s'authentifie une identité numérique proposé par le pays qu'il a sélectionné

Une fois le pays sélectionné par l'usager, celui ci-est redigié vers le noeud eIDAS du pays sélectionné. L'usager s'authentifie et s'identifie a

#### 4. L'usager confirme qu'il souhaite bien continuer vers sa démarche

Une page de confirmation s'affiche à l'usager lui permettant de vérifier ses donner d'identité et de consulter les données qui seront transmise à votre service.

<div class="fr-grid-row fr-grid-row--gutters fr-mb-3w">
    <div class="fr-col-9">

<img src="/images/fs/fc-eidas-confirmation.png" alt="Page de confirmation eIDAS" width="100%"/>

    </div>

</div>

#### 5. L'usager est authentifié auprès de son service
