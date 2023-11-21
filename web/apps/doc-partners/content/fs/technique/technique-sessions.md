---
key: fs-technique-session
title: Quelles sont les durées de vie des sessions et jetons de FranceConnect+ ?
layout: layouts/page.doc.njk
segments:
  [
    { url: '/fs/', title: 'Fournisseurs de services' },
    { url: '/fs/technique/', title: 'Documentation technique' },
  ]
category: 'fs-technique'
tags:
  - FranceConnect
  - FranceConnect+
abstract: 'FranceConnect et FranceConnect+ utilisent différents types de session. Leur durée varient en fonction de leur type et durent de quelques secondes à 30 minutes. '
seealso:
  - fs-technique-oidc
  - fs-technique-oidc-fc-plus
  - fs-technique-oidc-flow
order: 70
---

FranceConnect+ gère plusieurs types de données ayant une durée de vie limitée lors du déroulé d'une authentification par OpenID Connect ou de la fourniture d'un jeton d'accès à une ressource protégée (cinématique OAuth2 classique). Chacune de ces données possède une durée de vie qui lui est propre au delà de laquelle elle doit être régénérée. En voici le détail :

<div class="fr-table">

| Type               | Utilisé lors de ...                                                                                             | Durée de vie           |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Session Web        | A chaque authentification et pour maintenir la session côté FranceConnect+                                      | 30 minutes sans action |
| Access Token       | Récupération d'informations (phase 3 cinématique d'authentification / cinématique OAuth2)                       | 60 secondes            |
| Authorization code | Code fourni lors du début de la démarche d'authentification, il sert ensuite à récupérer l'access token         | 30 secondes            |
| Consentement       | Consentement donné par l'utilisateur pour l'accès à une ressource protégée (associée à un scope au sens OAuth2) | 5 secondes             |

</div>
