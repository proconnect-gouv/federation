---
key: fs-technique-oidc-flow
title: Quels échanges ont lieu entre mon service et FranceConnect+ lors d'une cinématique ?
layout: layouts/page.doc.njk
showBreadcrumb: true
segments:
  [
    { url: '/fs/', title: 'Fournisseurs de services' },
    { url: '/fs/technique/', title: 'Documentation technique' },
  ]
tags: ['FranceConnect+']
category: 'fs-technique'
abstract: "Retrouvez ici le diagrame de flux réprésentant les interactions en l'utilisateur, FranceConnect+ et votre fournisseur de service."
seealso:
  - fs-technique-oidc
  - fs-technique-oidc-fc-plus
order: 40
---

### Détail du fonctionnement

Le diagramme de flux représente entre l'utilisateur, FranceConnect+ et votre service est le suivant.

```mermaid
sequenceDiagram
   participant U as Utilisateur
   participant FC as FranceConnect
   participant FS as Fournisseur de Service

   Note right of U : L'utilisateur clique <br/>sur le bouton <br/>"FranceConnect"

    FS->>FC: GET [issuer]/.well-known/openid-configuration
    FC-->>FS: HTTP 200
    Note left of FS : FS récupère les <br/>métadatas du FI

   U->>FC: GET / POST <FC_URL>/api/v2/authorize
   FC-->>U: Redirect 302 <FS_URL>/<URL_CALLBACK>

   U->>FS: GET <FS_URL>/<URL_CALLBACK>

   FS->>FC: POST <FC_URL>/api/v2/token
   FC-->>FS: HTTP Response 200

   FS->>FC: GET <FC_URL>/api/v2/userinfo
   FC-->>FS: HTTP Response 200

   FS-->>U: Redirect 302 <FS_URL>/page_authentifiée


   note right of U: Plus tard, <br /> l'utilisateur se <br/> déconnecte

   U ->> FS: GET / POST ...
   FS-->>U: Redirect 302 <FC_URL>/api/v2/logout

   U->>FC: GET <FC_URL>/api/v2/logout
   FC-->>U: Redirect 302 <FC_URL>/<POST_LOGOUT_REDIRECT_URI>

   U-->FS: GET <FC_URL>/<POST_LOGOUT_REDIRECT_URI>

```

La récupération de l'identité pivot doit être faite dans la suite immédiate des appels précédents (authentification et récupération du code). Le fait d'appeler ce Web service plus tard n'est aujourd'hui pas proposé.
