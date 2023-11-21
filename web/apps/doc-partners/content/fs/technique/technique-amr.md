---
key: fs-technique-amr
title: Comment connaitre les méthodes utilisées pour l'usager pour s'authentifier ?
layout: layouts/page.doc.njk
tags:
  - FranceConnect
segments:
  [
    { url: '/fs/', title: 'Fournisseurs de services' },
    { url: '/fs/technique/', title: 'Documentation technique' },
  ]
category: 'fs-technique'
abstract: Il est possible de connaitre les méthodes d'authentification utilisées par l'usager en utilisant le claim amr proposé dans le cadre d'OpenID Connect.
seealso:
  - fs-technique-scope
  - fs-technique-oidc-fc
  - fs-technique-oidc
order: 65
---

Certains fournisseurs de service doivent s'assurer qu'une authentification multi-facteur ait été réalisée pour donner accès à leur démarche. Pour cela, il est nécessaire de récupérer auprès de FranceConnect les méthodes d'authentification utilisés par l'usager.

<div class="fr-alert fr-alert--info">
    <h3 class="fr-alert__title">Information : Contrôle des méthodes d'authentification par le fournisseur de service</h3>
    <p>FranceConnect met à disposition des fournisseurs de service les méthodes d'authentifiation utilisées par l'usager. Il est de la responsabilité du fournisseur de service de s'assurer que les méthodes d'authentification utilisées répondent à leurs exigences et d'adapter leur parcours d'authentification en fonction.</p>
</div>
<br/>

## Dans quel cas demander les méthodes d'authentification ?

Les méthodes d'authentification doivent être récupérer si le fournisseur de service doit renforcer l'authentification des ses usagers en attendant de passer sa démarches sur FranceConnect+. C'est notamment le cas des services soumis à la [PGSSI-S](https://esante.gouv.fr/produits-services/pgssi-s) et qui doivent passé en FranceConnect+ au 1er janvier 2026.

::: quote
« [EXI 01] Les moyens d’identification électronique autorisés pour l’identification électronique des usagers sur les
services numériques en santé doivent être limités :

- À des moyens d’identification électronique certifiés eIDAS de niveau de garantie substantiel ou élevé ;
- À l’application mobile carte Vitale (ApCV).
  Les moyens d’identification électronique de transition, tels que définis dans le présent référentiel, sont néanmoins
  autorisés jusqu’au 31 décembre 2025 au plus tard, sous réserve que les risques résiduels associés à leur utilisation
  soient considérés comme acceptables par le responsable du service numérique. »

_[Référentiel d'identification des usagers](https://esante.gouv.fr/produits-services/pgssi-s/corpus-documentaire)_

:::

## Quels sont les différents méthodes d'authentification qui peuvent être utilisées ?

LEs RFC suivantes proposent des valeurs normées pour les méthodes d'authentification :

- https://datatracker.ietf.org/doc/html/rfc8176
- https://datatracker.ietf.org/doc/html/draft-jones-oauth-amr-values-00

FranceConnect peut renvoyer une combinaison des valeurs suivantes ici des normes ci-dessus et de l'ajout d'une valeur supplémentaire (mail):

<div class="fr-table">

| AMR Name | AMR Description                                                                       |
| -------- | ------------------------------------------------------------------------------------- |
| pwd      | Password authentication, either by the user or the service if a client secret is used |
| pop      | Proof of possession of a key                                                          |
| mfa      | Multiple factor authentication                                                        |
| pin      | Personal Identification Number (PIN) [RFC4949] or pattern                             |
| mail     | confirmation by mail                                                                  |

</div>

## Qu'est ce qu'une authentification mutli-facteur et comment l'identifier ?

Vous pouvez vous reporter aux [RECOMMANDATIONS RELATIVES L'AUTHENTIFICATION MULTIFACTEUR ET AUX MOTS DE PASSE](https://www.ssi.gouv.fr/uploads/2021/10/anssi-guide-authentification_multifacteur_et_mots_de_passe.pdf) qui définit ce qu'est une authentification multi-facteur. Vous y retrouverez notamment la définition ci-dessous :

L’authentification multifacteur découle de la nécessité de renforcer la sécurité apportée par l’utilisation d’un unique facteur d’authentification, particulièrement lorsqu’il s’agit d’un mot de passe utilisé seul. Ainsi même si ce dernier est compromis, un facteur supplémentaire d’un type différent
est requis afin de s’authentifier.

Un facteur d’authentification est donc un facteur lié à une personne, relevant de diverses catégories :

- **facteur de connaissance :** « ce que je sais », il s’agit d’une connaissance devant être mémorisée
  telle qu’une phrase de passe, un mot de passe, un code, etc;
- **facteur de possession :** « ce que je possède », il s’agit d’un élément secret non mémorisable
  contenu dans un objet physique qui idéalement protège cet élément de toute extraction, tel
  qu’une carte à puce, un token, un téléphone, etc;
- **facteur inhérent :** « ce que je suis », il s’agit d’une caractéristique physique intrinsèquement
  liée à une personne et indissociable de la personne elle-même, telle qu’une caractéristique
  biologique (ADN), morphologique (empreinte digitale, empreinte rétinienne) ou comportementale 4
  (voix, frappe au clavier).

Suivant cette définition, FranceConnect retournera dans la liste des méthodes d'authentification la valeur _mfa_ lorsque les méthodes d'authentification utilisées répondront à la définition d'une authentification multi-facteur.

Ainsi, les listes de valeurs suivantes pourront être renvoyés par FranceConnect :

- `pwd` : seulement une authentification par mot de passe a été réalisée
- `pwd mail` : une compbinaison d'un mot de passe et d'un OTP par mail ont été réalisé, mais ne constituant pas une authentification multi-facteur
- `pin pop mfa` : un combinaison d'un preuve de possession et d'un code pin constituant une authentification mutlu-facteur.

En fonction de l'évolution des fournisseurs d'identité, il est possible que cette liste évolue.

<div class="fr-alert fr-alert--info">
    <h3 class="fr-alert__title">Information : niveau de garantie</h3>
    <p>Même si l'usager a utilisé une authentification multi-facteur, le nieau de garantie de l'identité délivrée par FranceConnect reste de niveau faible. Il s'agit seulement d'un renforcement de l'authentification ne permettant pas de remplir toutes les exigences du règlement eIDAS pour un niveau de garantie de niveau susbtantiel.</p>
</div>
<br/>

## Comment récupérer la liste des méthodes d'authentification utilisées ?

L'envoi de la liste des méthodes d'authentification par FranceConnect s'effectue au travers du claim _amr_ prévue par la norme OpenID Connect. Par défaut ce claim n'est pas retourner dans l'idtoken, il doit être demander explicitement lors de la requête `/authorize`. Il faut pour cela lui passer le paramètre _claims_ en paramètre en lui passant la valeur ci-dessous :

```json
{
  "id_token": {
    "amr": {
      "essential": true
    }
  }
}
```

Il est nécessaire de l'encoder pour le passer en paramètre de la requête HTTP

```http
claims=%7B%22id_token%22%3A%7B%22amr%22%3A%7B%22essential%22%3Atrue%7D%7D%7D
```

Cela donne par exemple ce type de requête :

```http
GET /api/v1/authorize?scope=openid+given_name+family_name+gender+preferred_username+birthdate&redirect_uri=https%3A%2F%2Ffournisseur-de-service.dev-franceconnect.fr%2Flogin-callback&response_type=code&client_id=2e5eaafcf2e1f0be4f8a6e1a03135ee1aac4a30412a6e243bce044da1a0726b4&state=state6c5222288585758f6563394dc638a3f00127a15359d9ef9b5be826bd405c8edf&nonce=noncecdb1c075ca435cedd2454c4fb0b55096280f1234b1a4d164c05f8538673d8819&claims=%7B%22id_token%22%3A%7B%22amr%22%3A%7B%22essential%22%3Atrue%7D%7D%7D&acr_values=eidas1 HTTP/1.1

```

Ce claim _amr_ est renvoyé dans l'IDToken conformément à la spécification <a href="https://openid.net/specs/openid-connect-core-1_0.html#IDToken" target="_blank" >OpenID Connect</a>

```json
{
  "iss": "https://fcp.integ01.dev-franceconnect.fr",
  "sub": "b6048e95bb134ec5b1d1e1fa69f287172a91722b9354d643a1bcf2ebb0fd2ef5v1",
  "aud": "2113454433e39cce01db448d80181bdfd005554b19cd51b3fe7943f6b3b86ab6e",
  "exp": 1697180854,
  "iat": 1697180794,
  "nonce": "123456789098765432123456789",
  "acr": "eidas1",
  "amr": ["pin", "pop", "mfa"]
}
```

::: callout En bref

Pour éviter à un usager d'avoir à s'authentifier auprès du FS avec un second facteur alors qu'il a déjà utilisé une authentification multi-facteur, il est possible de récupérer via le claim _amr_ la liste des méthodes d'authentification et d'adapter le parcours en fonction.

:::
