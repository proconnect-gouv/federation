---
key: fs-technique-env-fc-plus
title: Comment accéder aux différents environnements de FranceConnect+ ?
layout: layouts/page.doc.njk
segments:
  [
    { url: '/fs/', title: 'Fournisseurs de services' },
    { url: '/fs/technique/', title: 'Documentation technique' },
  ]
tags:
  - FranceConnect+
category: 'fs-technique'
abstract: "FranceConnect+ met à disposition deux environnements : la production et le bac-à-sable (intégration). Retrouvez ici l'ensemble des informations pour pouvoir y accéder."
seealso:
  - fs-projet-datapass
  - fs-technique-oidc-endpoints
  - fs-technique-oidc-fc-plus
  - fs-technique-oidc-flow
order: 47
---

## Comment accéder aux différents environnements de FranceConnect+ ?

FranceConnect met à disposition deux environnements :

- intégration : à utiliser pour l'ensemble de vos développements et test hors production
- production : à utiliser uniquement pour votre service en production

### Accès à l'environnement d'intégration FranceConnect+

#### Récupération des clés d'intégration

Pour accéder à l'intégration, après validation de votre demande d'habilitation, vous devez effectuer une [demande de création d'un fournisseur de service pour FranceConnect+](https://www.demarches-simplifiees.fr/commencer/demande-de-creation-d-un-fs-fc-plus).

#### Accès à l'environnement d'intégration

Pour vous permettre de réaliser les développements liés à l'intégration de FranceConnect, nous mettons à disposition un environnement d'intégration. Les accès à cet environnement se font à travers des clés qui vous sont communiquées sur votre espace partenaire.

Pour utiliser l'environnement d'intégration, il faut au préalable avoir :

- avoir fait une demande datapass et que celle-ci soit validée
- avoir fait une demande de création d'un FS en environnement d'intégration FC+ et avoir reçu vos clés d'intégration

Sur notre environnement d'intégration, vous pouvez utiliser le fournisseur d'identité "Démonstration" dont les données sont modifiables ici : https://github.com/france-connect/identity-provider-example/blob/master/database.csv

Les adresses de notre environnement d'intégration sont les suivantes :

<div class="fr-table">

| EndPoint                                                               | Adresse                                                                           |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [Discovery URL](technique-endpoints.md#openid-configuration-endpoints) | https://auth.integ01.dev-franceconnect.fr/api/v2/.well-known/openid-configuration |
| [JWKS URL](technique-endpoints.md#openid-configuration-endpoints)      | https://auth.integ01.dev-franceconnect.fr/api/v2/jwks                             |
| [Authorization](technique-endpoints.md#authorization-endpoint)         | https://auth.integ01.dev-franceconnect.fr/api/v2/authorize                        |
| [Token](technique-endpoints.md#token-endpoint)                         | https://auth.integ01.dev-franceconnect.fr/api/v2/token                            |
| [UserInfo](technique-endpoints.md#userinfo-endpoint)                   | https://auth.integ01.dev-franceconnect.fr/api/v2/userinfo                         |
| [Logout](technique-endpoints.md#logout-endpoint)                       | https://auth.integ01.dev-franceconnect.fr/api/v2/session/end                      |

</div>

### Accès à l'environnement de production FranceConnect+

#### Récupération des clés de production

Pour accéder à l'intégration, après qualification de votre intégration de FranceConnect+ dans votre service, vous devez effectuer une [demande de création d'un fournisseur de service pour FranceConnect+](https://www.demarches-simplifiees.fr/commencer/demande-de-creation-d-un-fs-fc-plus).

#### Accès à l'environnement de production

Pour avoir accès à l'environnement de production FranceConnect+, il faut au préalable avoir :

1. reçu la qualification de vos développements par FranceConnect+ sur un environnement autre que votre production;
2. demandé une mise en production via le formulaire à votre disposition [https://www.demarches-simplifiees.fr/commencer/demande-de-creation-d-un-fs-fc-plus](https://www.demarches-simplifiees.fr/commencer/demande-de-creation-d-un-fs-fc-plus);
3. configuré votre fournisseur de service de production FranceConnect+ avec les clés de production qui vous ont été fournies par l'équipe FranceConnect.

**Attention :** Il ne faut surtout pas utiliser les clés d'intégration que vous avez utilisées lors de vos développements avec votre Fournisseur de Service en production. Les clés d'intégration ne sont utilisables que sur l'environnement d'intégration FranceConnect+. De même, il n'est pas possible d'utiliser des clés de production de FranceConnect sur FranceConnect+.

Les adresses de notre environnement de production sont les suivantes :

<div class="fr-table">

| EndPoint                                                               | Adresse                                                                    |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Discovery URL](technique-endpoints.md#openid-configuration-endpoints) | https://auth.franceconnect.gouv.fr/api/v2/.well-known/openid-configuration |
| [JWKS URL](technique-endpoints.md#openid-configuration-endpoints)      | https://auth.franceconnect.gouv.fr/api/v2/jwks                             |
| [Authorization](technique-endpoints.md#authorization-endpoint)         | https://auth.franceconnect.gouv.fr/api/v2/authorize                        |
| [Token](technique-endpoints.md#token-endpoint)                         | https://auth.franceconnect.gouv.fr/api/v2/token                            |
| [UserInfo](technique-endpoints.md#userinfo-endpoint)                   | https://auth.franceconnect.gouv.fr/api/v2/userinfo                         |
| [Logout](technique-endpoints.md#logout-endpoint)                       | https://auth.franceconnect.gouv.fr/api/v2/session/end                      |

</div>
