---
key: fs-technique-oidc-endpoints
title: Comment utiliser les différents Endpoints FranceConnect+ ?
layout: layouts/page.doc.njk
segments:
  [
    { url: '/fs/', title: 'Fournisseurs de services' },
    { url: '/fs/technique/', title: 'Documentation technique' },
  ]
tags:
  - FranceConnect+
category: 'fs-technique'
abstract: "Le protocole OpenID Connect défini un certain nombre de endpoint pour échanger entre le service provider et l'identity provider. Retrouvez ici l'ensemble des endpoints à utiliser par un fournisseur de service pour échanger avec FranceConnect+."
seealso:
  - fs-technique-oidc
  - fs-technique-oidc-fc-plus
  - fs-technique-oidc-flow
  - fs-technique-scope
order: 46
---

FranceConnect+ met en oeuvre le protocole OpenID Connect pour permettre à un Fournisseur de Services de déléguer à FranceConnect+ l'identification et l'authentification des usagers.

### OpenID Configuration Endpoints

<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-106">
        
        <code>GET /api/v2/.well-known/openid-configuration</code></button>
    </h3>
    <div class="fr-collapse" id="accordion-106">

##### Description

Implémente la requête de `Provider Configuration`

https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfigurationRequest

##### Paramètres

> Aucun

##### Réponses

<div class="fr-table">

> | code http | content-type                   | réponse                                                    |
> | --------- | ------------------------------ | ---------------------------------------------------------- |
> | 200       | application/json;charset=utf-8 | Document JSON décrivant la configuration de FranceConnect+ |

</div>

##### Exemple d'appel

```http
GET /api/v2/.well-known/openid-configuration HTTP/1.1
Host: auth.integ01.dev-franceconnect.fr
```

Configuration FranceConnect+ sur l'environnement d'intégration:

https://auth.integ01.dev-franceconnect.fr/api/v2/.well-known/openid-configuration

  </div>
</section>

<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-107">
        
        <code>GET /api/v2/jwks</code></button>
    </h3>
    <div class="fr-collapse" id="accordion-107">

##### Description

Liste les clés de signature utilisées par FranceConnect+

##### Paramètres

> Aucun

<div class="fr-table">

| code http | content-type                   | réponse                                                         |
| --------- | ------------------------------ | --------------------------------------------------------------- |
| 200       | application/json;charset=utf-8 | Document JSON décrivant les clés de signature de FranceConnect+ |

</div>

##### Exemple d'appel

```http
GET /api/v2/jwks HTTP/1.1
Host: auth.integ01.dev-franceconnect.fr
```

Clés FranceConnect+ sur l'environnement d'intégration:

https://auth.integ01.dev-franceconnect.fr/api/v2/jwks

  </div>
</section>

</br>

### Authorization Endpoint

<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-108">
        
        <code>GET /api/v2/authorize</code></button>
    </h3>
    <div class="fr-collapse" id="accordion-108">

##### Description

Implémente le `Authorization Endpoint` de OpenID Connect:

https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationEndpoint

##### Paramètres

<div class="fr-table">

| nom             | requis/optionnel | type de données                | description                                                                                                                                                                                                                               |
| --------------- | ---------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `response_type` | requis           | string                         | `code`                                                                                                                                                                                                                                    |
| `client_id`     | requis           | string                         | `<CLIENT_ID>` Identifiant du FS, communiqué lors de son inscription auprès de FC+                                                                                                                                                         |
| `redirect_uri`  | requis           | string                         | ` <FS_URL>/<URL_CALLBACK>` Url de retour vers le FS (encodée), communiquée lors de son inscription auprès de FC+                                                                                                                          |
| `acr_values`    | requis           | string                         | `eidas2                                                                                                                                                                                                                                   | eidas3` FranceConnect+ supporte les niveaux eIDAS substantiel et élevé |
| `scope`         | requis           | string                         | `<SCOPES>` Liste des scopes demandés séparés par des espaces (%20 au format unicode dans l'URL) ou des '+'                                                                                                                                |
| `claims`        | optionnel        | string                         | `<CLAIMS>` Objet JSON encodé décrivant les claims demandés ([Voir spécification Openid Connect](https://openid.net/specs/openid-connect-core-1_0.html#ClaimsParameter))                                                                   |
| `state`         | requis           | string (minimum 22 caractères) | `<STATE>` Champ obligatoire, généré aléatoirement par le FS, que FC+ renvoie tel quel dans la redirection qui suit l'authentification, pour être ensuite vérifié par le FS. Il est utilisé afin d’empêcher l’exploitation de failles CSRF |
| `nonce`         | requis           | string (minimum 22 caractères) | `<NONCE>` Champ obligatoire, généré aléatoirement par le FS que FC renvoie tel quel dans la réponse à l'appel au `Token Endpoint`, pour être ensuite vérifié par le FS. Il est utilisé pour empêcher les attaques par rejeu               |
| `prompt`        | optionnel        | string                         | `login` FC+ force une demande de réauthentification avec le FI à chaque connexion                                                                                                                                                         |

</div>

##### Réponses

<div class="fr-table">

> | code http              | content-type              | réponse                                                                                                                                           |
> | ---------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `303` (succès)         | `text/html;charset=UTF-8` | Redirection vers la page de sélection du FI `/api/v2/interaction/{interactionHash}` où {interactionHash} est un hash lié à la session de l'usager |
> | `303` (erreur)         | `text/html;charset=UTF-8  | [Redirection vers le FS après erreur de connexion](#redirection-vers-le-fs-après-erreur-de-connexion)                                             |
> | `400` (mauvais format) | `text/html;charset=UTF-8` | La page d'erreur avec code `Y000400` est affichée en cas de mauvais format                                                                        |

</div>

##### Exemple d'appel

> ```
> GET /api/v2/authorize?response_type=code&prompt=login&acr_values=eidas2&
> scope=openid+gender+given_name+family_name+email+preferred_username&
> claims=%7B%22id_token%22%3A%7B%22amr%22%3A%7B%22essential%22%3Atrue%7D%7D%7D&
> client_id=6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950&
> redirect_uri=https%3A%2F%2Ffsp1v2.integ01.fcp.fournisseur-de-service.fr%2Foidc-callback&
> state=9ed67ae42fdc5d0a6867a5425a284745f4f73ce8b6edf76e453487aa1b73cc89&
> nonce=7db9b35458f2288bade947791f1c8fa2d02954f8eb7d9909dc68784f7c4aea29 HTTP/1.1
> Host: auth.integ01.dev-franceconnect.fr
> ```

  </div>
</section>

<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-109">
        <code>POST /api/v2/authorize</code></button>
    </h3>
    <div class="fr-collapse" id="accordion-109">

##### Description

Implémente le `Authorization Endpoint` de Openid Connect:

https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationEndpoint

##### Entête

<div class="fr-table">

> | nom            | requis/optionnel | valeur                              |
> | -------------- | ---------------- | ----------------------------------- |
> | `Content-Type` | requis           | `application/x-www-form-urlencoded` |

</div>

##### Body

<div class="fr-table">

> | nom             | requis/optionnel | type de données                | description                                                                                                                                                                                                                               |
> | --------------- | ---------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
> | `response_type` | requis           | string                         | `code`                                                                                                                                                                                                                                    |
> | `client_id`     | requis           | string                         | `<CLIENT_ID>` Identifiant du FS, communiqué lors de son inscription auprès de FC+                                                                                                                                                         |
> | `redirect_uri`  | requis           | string                         | `<FS_URL>%2F<URL_CALLBACK>` Url de retour vers le FS (encodée), communiquée lors de son inscription auprès de FC+                                                                                                                         |
> | `acr_values`    | requis           | string                         | `eidas2                                                                                                                                                                                                                                   | eidas3` FranceConnect+ supporte les niveaux eIDAS substantiel et élevé |
> | `scope`         | requis           | string                         | `<SCOPES>` Liste des scopes demandés séparés par des espaces (%20 au format unicode dans l'URL) ou des '+'                                                                                                                                |
> | `claims`        | optionnel        | string                         | `<CLAIMS>` Objet JSON encodé décrivant les claims demandés ([Voir spécification Openid Connect](https://openid.net/specs/openid-connect-core-1_0.html#ClaimsParameter))                                                                   |
> | `state`         | requis           | string (minimum 32 caractères) | `<STATE>` Champ obligatoire, généré aléatoirement par le FS, que FC+ renvoie tel quel dans la redirection qui suit l'authentification, pour être ensuite vérifié par le FS. Il est utilisé afin d’empêcher l’exploitation de failles CSRF |
> | `nonce`         | requis           | string (minimum 32 caractères) | `<NONCE>` Champ obligatoire, généré aléatoirement par le FS que FC renvoie tel quel dans la réponse à l'appel au `Token Endpoint`, pour être ensuite vérifié par le FS. Il est utilisé pour empêcher les attaques par rejeu               |
> | `prompt`        | optionnel        | string                         | `login` FC+ force une demande de réauthentification avec le FI à chaque connexion                                                                                                                                                         |

</div>

##### Réponses

<div class="fr-table">

> | code http              | content-type              | réponse                                                                                                                                            |
> | ---------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `303` (succès)         | `text/html;charset=UTF-8` | Redirection vers la page de recherche des FI `/api/v2/interaction/{interactionHash}` où {interactionHash} est un hash lié à la session de l'usager |
> | `303` (erreur)         | `text/html;charset=UTF-8` | [Redirection vers le FS après erreur de connexion](#redirection-vers-le-fs-après-erreur-de-connexion)                                              |
> | `400` (mauvais format) | `text/html;charset=UTF-8` | La page d'erreur avec code `Y000400` est affichée en cas de mauvais format                                                                         |

</div>

##### Exemple d'appel

> ```
> POST /api/v2/authorize HTTP/1.1
> Host: auth.integ01.dev-franceconnect.fr
> Content-Type: application/x-www-form-urlencoded
>
> response_type=code&prompt=login&acr_values=eidas2&
> scope=openid+gender+given_name+family_name+email+preferred_username&
> claims=%7B%22id_token%22%3A%7B%22amr%22%3A%7B%22essential%22%3Atrue%7D%7D%7D&
> client_id=6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950&
> redirect_uri=https%3A%2F%2Ffsp1v2.integ01.fcp.fournisseur-de-service.fr%2Foidc-callback&
> state=9ed67ae42fdc5d0a6867a5425a284745f4f73ce8b6edf76e453487aa1b73cc89&
> nonce=7db9b35458f2288bade947791f1c8fa2d02954f8eb7d9909dc68784f7c4aea29
> ```

  </div>
</section>

<br/>

### Redirection vers le FS après erreur de connexion

<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-110">
        
        <code>GET &lt;FS_URL&gt;/&lt;URL_CALLBACK&gt;</code></button>
    </h3>
    <div class="fr-collapse" id="accordion-110">

##### Description

Redirection vers le FS après une erreur de connexion.

FranceConnect+ renvoie le code d'erreur, la description de l'erreur et le state.

##### Paramètres

<div class="fr-table">

> | nom                 | requis/optionnel | type de données                | description                                                                                                                                                             |
> | ------------------- | ---------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `error`             | requis           | string                         | code d'erreur                                                                                                                                                           |
> | `error_description` | requis           | string                         | description de l'erreur                                                                                                                                                 |
> | `state`             | requis           | string (minimum 32 caractères) | `<STATE>` communiqué par par le FS dans l'appel au `Authorization Endpoint`. Cette information est à vérifier par le FS, afin d’empêcher l’exploitation de failles CSRF |

</div>

##### Exemple d'appel

Exemple de retour vers le FS de mock

> ```
> GET /oidc-callback?state=9ed67ae42fdc5d0a6867a5425a284745f4f73ce8b6edf76e453487aa1b73cc89
> error_description=User+auth+aborted&error=access_denied HTTP/1.1
> Host: fsp1v2.integ01.fcp.fournisseur-de-service.fr
> ```

  </div>
</section>

<br/>

### Redirection vers le FS après connexion

<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-111">
        
        <code>GET &lt;FS_URL&gt;/&lt;URL_CALLBACK&gt;</code></button>
    </h3>
    <div class="fr-collapse" id="accordion-111">

##### Description

Redirection vers le FS après connexion chez le FI.

FranceConnect+ renvoie le code d'autorisation et le state.

##### Paramètres

<div class="fr-table">

> | nom     | requis/optionnel | type de données                | description                                                                                                                                                             |
> | ------- | ---------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `code`  | requis           | string                         | `<AUTHZ_CODE>` code d'autorisation à transmettre au `Token Endpoint`                                                                                                    |
> | `state` | requis           | string (minimum 32 caractères) | `<STATE>` communiqué par par le FS dans l'appel au `Authorization Endpoint`. Cette information est à vérifier par le FS, afin d’empêcher l’exploitation de failles CSRF |

</div>

##### Exemple d'appel

Exemple de retour vers le FS de mock

> ```
> GET /oidc-callback?code=_DOF10msXreojwyScrXmfqvwp8q3p1G7ZIzatMj60it&
> state=9ed67ae42fdc5d0a6867a5425a284745f4f73ce8b6edf76e453487aa1b73cc89 HTTP/1.1
> Host: fsp1v2.integ01.fcp.fournisseur-de-service.fr
> ```

  </div>
</section>

<br/>

### Token Endpoint

<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-112">
        
        <code>POST /api/v2/token</code></button>
    </h3>
    <div class="fr-collapse" id="accordion-112">

##### Description

Implémente le `Token Endpoint` de Openid Connect:

https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint

##### Entête

<div class="fr-table">

| nom            | requis/optionnel | valeur                              |
| -------------- | ---------------- | ----------------------------------- |
| `Content-Type` | requis           | `application/x-www-form-urlencoded` |

</div>

##### Body

<div class="fr-table">

| nom             | requis/optionnel | type de données | description                                                                                                             |
| --------------- | ---------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `grant_type`    | requis           | string          | `authorization_code`                                                                                                    |
| `client_id`     | requis           | string          | `<CLIENT_ID>` Identifiant du FS, communiqué lors de son inscription auprès de FC+                                       |
| `client_secret` | requis           | string          | `<CLIENT_SECRET>` Le secret du FS, communiqué lors de son inscription auprès de FC+                                     |
| `redirect_uri`  | requis           | string          | ` <FS_URL>%2F<URL_CALLBACK>` Url de retour vers le FS (encodée), communiqué lors de l'appel au `Authorization Endpoint` |
| `code`          | requis           | string          | `<AUTHZ_CODE>` code d'autorisation fourni par FranceConnect+ après connexion                                            |

</div>

##### Réponses

<div class="fr-table">

| code http | content-type                     | réponse                                                 |
| --------- | -------------------------------- | ------------------------------------------------------- |
| `200`     | `application/json;charset=utf-8` | La réponse contenant l'access token                     |
| `400`     | `application/json;charset=utf-8` | JSON document décrivant l'origine de l'erreur de format |

</div>

##### Format de la réponse en succès

```
{
  'access_token': <ACCESS_TOKEN>,
  'token_type': 'Bearer',
  'expires_in': 60,
  'id_token': <ID_TOKEN>
}
```

Voir le format de l'[id_token](../doc_fs.md#id_token).

  </div>
</section>

<br/>

### UserInfo Endpoint

<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-113">
        
        <code>GET /api/v2/userinfo</code></button>
    </h3>
    <div class="fr-collapse" id="accordion-113">

##### Description

Implémente le `UserInfo Endpoint` de Openid Connect:

https://openid.net/specs/openid-connect-core-1_0.html#UserInfo

##### Entête

<div class="fr-table">

| nom             | requis/optionnel | valeur                                                                               |
| --------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `Authorization` | requis           | `Bearer <ACCESS_TOKEN>` où `<ACCESS_TOKEN>` a été communiqué par le `Token Endpoint` |

</div>

##### Paramètres

> Aucun

##### Réponses

<div class="fr-table">

> | code http | content-type                     | réponse                                                 |
> | --------- | -------------------------------- | ------------------------------------------------------- |
> | `200`     | `application/jwt`                | JSON Web Token contenant les claims transmis par le FI  |
> | `400`     | `application/json;charset=utf-8` | JSON document décrivant l'origine de l'erreur de format |

</div>

Voir le format de [userinfo](../doc_fs.md#userinfo).

  </div>
</section>

<br/>

#### Logout Endpoint

<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-114">
        
        <code>GET /api/v2/session/end</code></button>
    </h3>
    <div class="fr-collapse" id="accordion-114">

##### Description

Implémente le `Logout Endpoint` de Openid Connect:

http://openid.net/specs/openid-connect-session-1_0.html#RPLogout

:warning: Cet appel doit être réalisé via une redirection dans le navigateur de l'usager, afin d'expirer les cookies de session FranceConnect+ et FI.

##### Paramètres

<div class="fr-table">

> | nom                        | requis/optionnel | type de données | description                                                                                                                                                                                                                           |
> | -------------------------- | ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `id_token_hint`            | requis           | string          | JWT renvoyé par le endpoint `Token Endpoint`                                                                                                                                                                                          |
> | `state`                    | requis           | string          | `<STATE>` Champ obligatoire, généré aléatoirement par le FS, que FC+ renvoie tel quel dans la redirection qui suit la déconnexion, pour être ensuite vérifié par le FS. Il est utilisé afin d’empêcher l’exploitation de failles CSRF |
> | `post_logout_redirect_uri` | requis           | string          | `<POST_LOGOUT_REDIRECT_URI>` L'URL de redirection vers le FS après la déconnexion à FranceConnect+                                                                                                                                    |

</div>

##### Réponses

<div class="fr-table">

> | code http | content-type              | réponse                                                                                                                             |
> | --------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
> | `303`     | `text/html;charset=UTF-8` | Redirection vers le FI pour déconnexion, puis [redirection vers le FS après déconnexion](#redirection-vers-le-fs-après-déconnexion) |

</div>

##### Exemple d'appel

> ```
> GET /api/v2/session/end?id_token_hint=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MDRlMDI0Mj
> I5MDE1ZDJiZDQ3ZjdhNWU1YWIwNWIzNWM4MzM2YWI0MDNjMzgwMjI5ODVmOGNmYWRjODZmZTkxIiwiYW1yIjpbInB3ZCJdLCJ
> hdXRoX3RpbWUiOjE2Njg1MzAzMjYsImFjciI6ImVpZGFzMSIsIm5vbmNlIjoiYWZjODFmZGExZmJiNmQzYzg3NmFmNzVjNzM3
> YTEzMDdhMWIyOWJhMDg3M2VmYTA1OWU0NTM1ZDEyMmM5ZGI1YSIsImF0X2hhc2giOiJJVEJTV1J2NW1HRmxxTGQ0Sm5nbnRnI
> iwiYXVkIjoiNjkyNWZiODE0M2M3NmVkZWQ0NGQzMmI0MGMwY2IxMDA2MDY1ZjdmMDAzZGU1MjcxMmI3ODk4NTcwNGYzOTk1MC
> IsImV4cCI6MTY2ODUzMDM4NiwiaWF0IjoxNjY4NTMwMzI2LCJpc3MiOiJodHRwczovL2ZjYS5pbnRlZzAxLmRldi1hZ2VudGN
> vbm5lY3QuZnIvYXBpL3YyIn0.hg1n4WJbzZECwz4VldAybXYreEXJ4fxpSWqDs9V4tTk&
> state=3b7bd7fb38ccab89864563f17a89c4cb3bd400164ce828b4cfc2cb01ce8ed9da&
> post_logout_redirect_uri=https%3A%2F%2Ffsa1v2.integ01.dev-agentconnect.fr%2Flogout-callback HTTP/1.1
> Host: auth.integ01.dev-franceconnect.fr
> ```

  </div>
</section>

<br/>

### Redirection vers le FS après déconnexion

<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-115">
        
        <code>GET &lt;FS_URL&gt;/&lt;POST_LOGOUT_REDIRECT_URI&gt;</code></button>
    </h3>
    <div class="fr-collapse" id="accordion-115">

##### Description

Redirection vers le FS après déconnexion.

FranceConnect+ renvoie le state communiqué par le FS lors de la demande de déconnexion.

##### Paramètres

<div class="fr-table">

> | nom     | requis/optionnel | type de données                | description                                                                                                                                                      |
> | ------- | ---------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `state` | requis           | string (minimum 32 caractères) | `<STATE>` communiqué par par le FS dans l'appel au `Logout Endpoint`. Cette information est à vérifier par le FS, afin d’empêcher l’exploitation de failles CSRF |

</div>

##### Exemple d'appel

Exemple de retour vers le FS de mock à déconnexion

> ```
> GET /logout-callback?state=3b7bd7fb38ccab89864563f17a89c4cb3bd400164ce828b4cfc2cb01ce8ed9da HTTP/1.1
> Host: fsp1v2.integ01.fcp.fournisseur-de-service.fr
> ```

  </div>
</section>

<br/>
