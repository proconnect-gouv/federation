---
key: fs-technique-erreurs
title: Comment gérer les erreurs renvoyées par FranceConnect+ ?
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
  - fs-technique-oidc-endpoints
  - fs-technique-oidc-fc-plus
  - fs-technique-oidc-flow
order: 45
---

En tant qu'OpenID Connect provider, FranceConnect+ peut renvoyer toutes sortes d'erreurs à une application cliente. Pour ce faire, FranceConnect+ passe par le mécanisme de retour d'erreurs d'un fournisseur d'identité openid connect tel que décrit dans la norme ( <a href="http://openid.net/specs/openid-connect-core-1_0.html#AuthError" target="_blank">http://openid.net/specs/openid-connect-core-1_0.html#AuthError</a> , en particulier les sections 3.1.2.6 (authentification), 3.1.3.4 (jeton d'accès), 5.3.3 (service d'informations utilisateur) )

FranceConnect+ peut renvoyer une dans différent cas :

- la requête émise par le fournisseur de service n'est pas correcte;
- un problème technique a empeché FranceConnect+ de traiter correctement la requête;
- l'utilisateur a souhaité revenir vers le fournisseur de service sans aller au bout de son authentification;
- les données d'identités de l'utilisateur ne permettent pas de l'authentifier ou de l'identifier, notamment lorsque la personne n'est pas présente dans le RNIPP, qu'une homonymie parfaite existe dans le RNIPP, que la personne est décédée;

Dans ce cas, l'utilisateur est redirigé quand cela est possible vers le fournisseur de service en respectant la norme OpenID Connect. Pour cela, l'url de callback (redirect_uri) passée en paramètre de la requête '/authorize' et utilisé avec les paramètres suivants :

<div class="fr-table">

| Paramètre         | Description                                         |
| ----------------- | --------------------------------------------------- |
| error             | code d'erreur identifiant l'erreur                  |
| error_description | description de l'erreur                             |
| state             | valeur du state passé lors de la requête /authorize |

</div>

```http
HTTP/1.1 302 Found
Location: https://client.example.org/cb?
    error=invalid_request
    &error_description=
      Unsupported%20response_type%20value
    &state=af0ifjsldkj
```

### Les codes d'erreur possible

Les erreurs que peuvent renvoyer FranceConnect ou FranceConnect+ sont les suivantes :

- [invalid_scope](#invalid-scope)
- [invalid_request](#invalid-request)
- [access_denied](#access-denied)
- [server_error](#server-error)
- [temporarily_unavailable](#temporarily-unavailable)

Il est également possible que des codes erreurs d'erreur de la forme Yxxxxx ou Exxxxx soit utilisé mais devrait à terme ne plus être utilsé et remplacé par des codes standards.

#### invalid_scope

Ce code d'erreur est renvoyé lorsque les données demandés dans la requête '/authorize' au travers des scopes ne sont pas autorisé. Ce problème intervient généralement pendant la phase de développement, lors de la mise en production ou la mise à jour de la fonctionnalité de connexion via FranceConnect ou FranceConnect+ dans votre service.

###### Qu'indiquer à l'usager ?

Lorsqu'un usager rencontre ce type d'erreur, il ne pourra pas s'authentifier à votre service via FranceConnect ou FranceConnect+. Il est recommander de rediriger l'usager votre page de connexion de votre service en indiquant qu'il n'a pas été possible de se connecter et choisir un autre mode de connexion.

###### Que faire pour corriger le problème ?

Si ce problème se produit pour un usger, il est problable que ce problème se reproduise pour l'ensemble de vos usagers. L'accès à votre service via FranceConnect ou FranceConnect+ est alors impossible.

Pour corriger ce problème, il est nécessaire dans un premier temps de retirer les scopes pour lesquels vous n'avez pas l'autorisation. Si vous avez absolument besoin d'accéder à des informations dont vous n'avez pas l'autorisation, il est nécessaire de mettre à jour sa demande d'habilitation pour obtenir l'autorisation d'acceder à ces données et de pouvoir ainsi demander les scopes correspondants.

#### invalid_request

Ce code d'erreur indique que la requête `/authorize` n'est pas correcte est qu'elle ne peut être traitée par FranceConnect ou FranceConnect+. Cette erreur se produit généralement lors de la phase de développement.

###### Qu'indiquer à l'usager ?

Lorsqu'un usager rencontre ce type d'erreur, il ne pourra pas s'authentifier à votre service via FranceConnect ou FranceConnect+. Il est recommander de rediriger l'usager votre page de connexion de votre service en indiquant qu'il n'a pas été possible de se connecter et choisir un autre mode de connexion.

###### Que faire pour corriger le problème ?

Si ce problème se produit pour un usger, il est problable que ce problème se reproduise pour l'ensemble de vos usagers. L'accès à votre service via FranceConnect ou FranceConnect+ est alors impossible.

Pour corriger le problème, il convient de modifier vos développements pour que la requête `/authorize` fonctionne. Pour cela, vous pouvez consulter cette documentation pour comprendre les points qui seraient mal implémenté.

#### access_denied

Ce code d'erreur indique que l'utilisateur n'a pas pu réaliser son authentification. Cela peut être du à plusieurs raisons mais qui concernent forcement l'utilisateur :

- l'utilisateur a souhaiter revenir en arrièce en arrivant sur FranceConnect ou FranceConnect+
- l'utilisateur n'a pas réussi à s'authentifié chez le fournisseur de service
- les contrôles réalisés par FranceConnect auprès du RNIPP ne permettent pas de laisser l'utilisateur continuer son authentification. C'est le cas par exemple
  - si l'utilisateur n'est pas référencé dans le RNIPP;
  - s'il existe des homonymies parfaites dans le RNIPP sur l'ensemble des données de l'identité pivot;
  - si l'utilisateur est décédé;
  - si des données d'identités obligatoire de l'utilisateur son manquante.

###### Qu'indiquer à l'usager ?

Lorsqu'un usager rencontre ce type d'erreur, vous pouvez demander à l'usager de réaliser une nouvelle tentative de connexion ou de choisir un autre mode de connexion.

S'il a la possibilité de nous contacter pour corriger le problème, il aura déjà été invité par FranceConnect ou FranceConnect+ à contacter le support pour que nous l'accompagnons dans la résolution de son problème.

###### Que faire pour corriger le problème ?

Il n'y a rien a faire à ce stade de votre coté.

#### server_error

Ce code d'erreur indique qu'une erreur inattendue s'est produit sur le serveur FranceConnect ou FranceConnect+ lors du traitement d'une requête et qu'il n'a pas été possible de réaliser l'action attendue.

###### Qu'indiquer à l'usager ?

Lorsqu'un usager rencontre ce type d'erreur, vous pouvez demander à l'usager de réaliser une nouvelle tentative de connexion ou de choisir un autre mode de connexion.

###### Que faire pour corriger le problème ?

Il se peut que ce problème soit temporaire et qu'une nouvelle tentative de connexion suffise. Si le problème persiste, nous vous invitons à contacter le support partenaire FranceConnect pour que nous puissions analyser et corriger le problème.

#### temporarily_unavailable

Ce code d'erreur indique que FranceConnect ou FranceConnect+ est temporairement indisponible.

###### Qu'indiquer à l'usager ?

Lorsqu'un usager rencontre ce type d'erreur, vous pouvez demander à l'usager de réaliser une nouvelle tentative de connexion ou de choisir un autre mode de connexion.

###### Que faire pour corriger le problème ?

Le problème est temporaire. Une nouvelle tentative de connexion suffise quelques instant plus tard devrait fonctionner normalement. Si le problème persiste, nous vous invitons à contacter le support partenaire FranceConnect pour que nous puissions analyser et corriger le problème.

##### Exxxxx ou Yxxxxx

Ces erreurs sont des erreurs qui ne devraient bientot plus remonter au fournisseur de service. Si vous rencontrez ces erreurs, nous vous invitons à consulter la page suviante qui devrait expliquer l'origine du problème : [https://github.com/france-connect/sources/blob/main/back/\_doc/erreurs.md](https://github.com/france-connect/sources/blob/main/back/_doc/erreurs.md)

###### Qu'indiquer à l'usager ?

Lorsqu'un usager rencontre ce type d'erreur, vous pouvez demander à l'usager de réaliser une nouvelle tentative de connexion ou de choisir un autre mode de connexion.

###### Que faire pour corriger le problème ?

Cela va dépendre du problème indiquer dans la page de documentation des erreurs. Si le problème persiste, nous vous conseillons de solliciter le support partenaires FranceConnect.
