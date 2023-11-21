---
key: fs-technique-oidc
title: Qu'est ce que le protocole OpenID Connect ?
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
  - eIDAS
abstract: "FranceConnect et FranceConnect+ utilise le protocole OpenID Connect. Il s'agit d'un protocole basé sur OAuth 2.0 qui permet notamment à un service de déléguer l'authentification et l'identification des ses utilisateurs."
seealso:
  - fs-technique-oidc-flow
  - fs-technique-oidc-fc-plus
  - fs-technique-erreurs
  - fs-technique-scope
  - fs-technique-env-fc-plus
  - fs-technique-oidc-endpoint
order: 10
---

## Qu'est ce que le protocole OpenID Connect ?

Le protocole OpenID Connect est au cœur du fonctionnement de FranceConnect. C'est une couche d'identification basée sur protocole OAuth 2.0. Il permet à des _Clients_ d'accéder à l'identité des _Utilisateurs_ par l'intermédiaire d'un _Serveur d'Autorisation_ .

La spécification du protocole se trouve sur http://openid.net/connect/.

Pour une référence d'implémentation OpenID Connect voici le lien : https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth

### Qu'est ce que le protocole OAuth 2.0

OAuth 2.0 est un protocole destiné délégué les accès à des resources. Son objectif est de décrire comment l'accès à des ressources, des données, exposées par exemple sous la forme d'API sécurisé, peut être délégué à un client, une application ou un service en ligne, en ayant recueilli l'autorisation de l'utilisateur.

Ce protocole fait intervenir quatre acteurs :

- _Resource owner_ : il s'agit de la personne qui est propriétaire des resources, le plus souvent c'est l'utilisateur;
- _Resource server_ : il s'agit du serveur qui héberge les resources du _Resource owner_;
- _Client_ : il s'agit de l'application ou du service qui souhaite accéder aux ressources
- _Authorization Server_ : Il s'agit du serveur qui recueiller les autorisations des propriétaires des ressources et génère le jeton d'autorisation qui sont utilisé pour accéder aux ressources.

Le serveur d'autorisation gère deux types de jetons :

- _access token_ : jeton qui permet de valider l'accès à un ressource. La durée de validité de ce jeton est limité et généralement de l'ordre de quelques minutes;
- _refresh token_ : jeton qui permet de renouveller l'autorisation sans la demander à nouveau au propriétaire de la ressource. Il permet de récupérer un nouvel _access token_. La durée de validité de ce jeton est généralement de plusieurs jours voir de plusieurs mois. Ce jeton doit être stocké de manière sécurisé par le client.

Les clients doivent être déclarés auprès du serveur d'autorisation. Les informations à fournir par le client sont :

- le nom de l'application
- la liste des urls de redirections : il s'agit des urls vers lesquelles les utilisateurs vont être redirigé par le serveur d'autorisation, une fois l'autorisation accordé.
- les types d'autorisation qui pourront être utilisé par le client

Une fois déclarée, le serveur d'autorisation fourni au client un couple de client_id / client_secret qui permettra d'autthenfier le client auprès du serveur d'autorisation.

Le diagramme de séquence représente de manière générale les intégrations dans une cinématique OAuth 2.0

<img src="/images/diagrams/diagram-sequence-oauth.png" alt="drawing" />

1. Le client demande un accès au ressource auprès du proriétaire des ressources ( \*resource owner ) en précisant le périmètre de la demande à l'aide de scopes. Le client s'identifie à l'aide de son client_id et indique le type d'autorisation demandée.

2. Si le propriétaire de la ressource accepte d'accorder l'accès à ces ressources, une autorisation d'accès est délivrer au client

3. Le client demande auprès du serveur d'autorisation un jeton d'accès ( _access token_ ) en s'authentifiant et en fournissant l'autorisation d'accès reçu à l'étape précédente.

4. Le serveur d'autorisation fourni un jeton d'accès après avoir authentifié le client et vérifier la validité de l'autorisation d'accès.

5. Le client demande des ressources au serveur de ressources en fournissant l'access token fourni par le serveur d'autorisations.

6. Le serveur de ressources retournes les ressources demandés en ayant au préalable vérifié la validité de l'access token.

OAuth 2.0 propose les types d'autorisations suivants: authorization code, implicit, resource owner credentials, client credentials.

Il faut noter que le protocole OAuth 2.O ne gère pas l'authentification de l'utilisateur. L'identité de l'utilisateur ne permet pas au client d'accéder au informations d'identités de l'utilisateur. Afin de rajouter ces informations, le protocole Openid Connect étant OAuth 2.0 pour intégrer l'accès aux informations d'identités de l'utilisateur.

### Qu'apporte OpenID Connect à OAuth 2.0 ?

Le protocole OpenID Connect s'appuie sur OAuth 2.0 en ajoutant des fonctionnalités supplémentaires :

- La gestion d'information sur l'authentification
- l'ajout d'un ID Token
- la gestion d'un SSO et d'une déconnection
- une API pour récupérer les informations sur l'utilisateur (/userinfo)
- un standard sur les informations sur l'utilisateur
- un service de découverte des informations du serveur OpenID.

#### Quels sont les acteurs qui interviennent dans OpenId Connect ?

OpenId Connect fait intervenir 3 acteurs :

<div class="fr-table">

| Acteur OpenId Connect | Acteur similaire dans OAuth 2.0 |
| --------------------- | ------------------------------- | --- |
| User                  |   Resource Owner                |
| Relying Party         |  Client                         |     |
| OpenID Provider       |  Authorization Server           |

</div>

#### Qu'est ce que l'ID Token ?

L'ID token est un jeton au format JWT qui est fourni en même temps que l'_access token_, il contient

- des information sur l'authtentification
  - dates d'expiration, d'authentification, de création
  - des moyens de contrôle permettant de valider l'ID Token et l'Access Token
- des attributs ( claims ) sur l'utilisateurs, qui peuvent être :
  - standard : profile, email, address, phone, ...
  - personnalisés par le serveur OpenId Connect.

**Exemple d'ID Token :**

```json
{
  "sub": "4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1",
  "amr": ["fc"],
  "auth_time": 1619605379,
  "acr": "eidas3",
  "nonce": "8c1696f884cac760436c9551ce34be81a3ab61171bf486dd31a58d2bc23a7bbd",
  "at_hash": "zc4hJ6cxMmrkb8KQn9UXbg",
  "aud": "6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950",
  "exp": 1619605440,
  "iat": 1619605380,
  "iss": "https://corev2.docker.dev-franceconnect.fr/api/v2"
}
```

[Plus d'information sur l'ID Token](https://openid.net/developers/specs/)

#### Quels sont les endpoints d'OpenId Connect ?

Le protocole OpenID Connect propose les endpoints suivants :

- **authorization** : permet de demander une authentification de l'utilisateur
- **token** : permet de demander un tocket ( _access token_, _refresh token_, _id token_ )
- **userinfo** : permet de récupérer les informations sur l'utilisateur
- **revocation** : permet de révoquer un token (_access token_, _refresh token_)
- **introspection** : permet de valider un jeton (_access token_, _refresh token_)
- **discovery** : permet de récupérer des informations sur le serveur OpenId Connect

#### Comment récupérer les tokens ?

OpenID Connect propose principalement trois types de flow qui permettent de récupérer des tokens :

- **Authorization code flow** : l'appel au endpoint _authorization_ permet de récupérer un code d'autorisation qui est utilisé pour récupérer les tokens.
- **Implicit flow** : l'appel au endpoint _authorization_ permet de récupérer directement les tokens, le refresh token ne peut pas être récupéré.
- **Hybrid flow** : Il s'agit d'un mix entre les deux.

:::callout En bref
OpenID Connect est un protocole utilisé par FranceConnect et FranceConnect+ pour permettre aux fournisseurs de service de déléguer l'authentification et l'identification des leurs utilisateurs.

Ce protocole est une extension d'OAuth 2.
:::
