---
title: Fournisseurs de service
layout: layouts/page.njk
eleventyNavigation:
  title: Fournisseurs de service
  order: 1
  key: fs
showBreadcrumb: true
---

# Documentation Fournisseur de Service

Vous souhaitez utiliser FranceConnect ou FranceConnect+ sur votre service ou votre démarches en lignes simplifier ou sécuriser l'accès de vos utilisateurs ou usager, vous êtes au bon endroit ! Cette documentation va vous permettre de découvrir :

- ce que FranceConnect ou FranceConnect+ peut apporter à votre service ou votre démarche en ligne
- les étapes pour vous permettre d'intégrer FranceConnect ou FranceConnect+
- la documentation technique de FranceConnect et de FranceConnect+

## Documentation

{% from "components/component.njk" import component with context %}

<div class="fr-grid-row fr-grid-row--gutters fr-mb-3w">
  <div class="fr-col-12">
  {{ component("card-simple", {
      url: "/fs/pilotage/",
      title: "Je souhaite comprendre le fonctionnment générale de FranceConnect et FranceConnect+",
      description: "Vous vous posez des questions sur le fonctionnement général de FranceConnect, FranceConnect+ et leur écosystème. Vous souhaitez comprendre ce que peut apporter FranceConnect et FranceConnect+ à votre service.  Vous trouverez l'ensemble des réponses à vos questions dans cette section",
      tags: ["FranceConnect", "FranceConnect+"],
      orientation: "horizontal"
  }) }}
  </div>

  <div class="fr-col-12">
  {{ component("card-simple", {
      url: "/fs/projet/",
      title: "Je veux savoir comment intégrer FranceConnect ou FranceConnect+ à mon service",
      description: "Vous allez ou vous avez lancé un projet intégrer FranceConnect ou FranceConnect+ dans votre service et vous souhaitez connaitre les différentes problématiques d'intégration. Vous souhaitez avoir des informations précises sur le fonctionnement de FranceConnect et de FranceConnect+ pour gérer votre intégration. Vous trouverez l'ensemble des réponses à vos questions dans cette section.",
      tags: ["FranceConnect", "FranceConnect+"],
      orientation: "horizontal"
  }) }}
  </div>

  <div class="fr-col-12">
  {{ component("card-simple", {
      url: "/fs/technique/",
      title: "Je veux consulter la documentation technique de FranceConnect ou de FranceConnect+",
      description: "Vous avez besoin d'accéder à la documentation technique permettre d'intégrer FranceConnect ou FranceConnect à votre service. Vous avez vous comprendre comment FranceConnect et FranceConnect+ utilisent le protocole OpenID Connect pour communiquer avec votre service. Vous trouverez dans cette section l'ensemble de la documentation technique dans cette section",
      tags: ["FranceConnect", "FranceConnect+"],
      orientation: "horizontal"
  }) }}
  </div>
</div>
