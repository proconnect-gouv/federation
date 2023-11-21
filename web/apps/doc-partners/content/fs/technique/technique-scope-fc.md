---
key: fs-technique-scope
title: Comment utiliser les scopes OpenID Connect pour accéder aux données des utilisateurs ?
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
abstract: L'utlisation des scopes proposés par OpenID Connect permettent de définir la liste des données que votre service peut récupéré auprès de FranceConnect ou FranceConnect+ et des fournisseurs de données.
seealso:
  - fs-technique-oidc
  - fs-technique-oidc-fc-plus
  - fs-projet-donnees-identites
  - fs-technique-eidas-identite
order: 39
---

Les données des utilisateurs mis à disposition d'un fournisseur de service est décrit à la page [Je veux connaitre les données que je peux récupérer de FranceConnect+ ](../projet/projet-donnees-fc+.md). Pour rappel les données d'identité accessible sont les suivantes :

- Nom de naissance
- Prénoms
- Sexe
- Date de naissance
- [Code géographique INSEE de la ville de naissance](https://www.insee.fr/fr/information/2560452)
- [Code géographique INSEE du pays de naissance](https://www.insee.fr/fr/information/2560452)
- Nom d'usage

### Scope et Claims dans OpenID Connect

#### Qu'est ce qu'un scope dans OpenID Connect ?

> Les clients OpenID Connect utilisent des _scopes_ tels que définis dans la section 3.3 de [OAuth 2.0 [RFC6749]](https://openid.net/specs/openid-connect-basic-1_0.html#RFC6749) pour spécifier quels privilèges d'accès sont demandés pour les _access token_. Les _scopes_ associées aux _access token_ déterminent les ressources qui seront disponibles lorsqu'elles sont utilisées pour accéder aux _endpoints_ protégés par OAuth 2.0. Pour OpenID Connect, les _scopes_ peuvent être utilisées pour demander que des ensembles d'informations spécifiques soient mis à disposition en tant que _claims_.

_Source: [OpenID Connect Basic Client Implementer's Guide 1.0](https://openid.net/specs/openid-connect-basic-1_0.html#Scopes)_

Le protocole OpenID Connect défini un certain nombre de [scopes standards](https://openid.net/specs/openid-connect-basic-1_0.html#Scopes) qu'il est possible d'étendre avec des _scopes_ spécifiques supplémentaires en fonction du besoin de l'_identity provider_.

_En bref :_ Les scopes permettent de définir l'ensemble des informations à disposition du fournisseur de service pour une cinématique.

#### Qu'est ce qu'un claim dans OpenID Connect ?

Dans OpenId Connect, un claim est une information relative à l'utilisateur ou à la phase l'authentification. Ces informations peuvent être disponible soit dans l'ID Token, soit dans la réponse du UserInfo. Les claims retournés dans ces jetons dépendent des scopes associés à l'_access token_.

Le protocole OpenId Connect defini un certain nombre de [claims standards](https://openid.net/specs/openid-connect-core-1_0.html#Claims).

_En Bref :_ Les claims sont les informations sur l'utilisateur ou la phase d'authentification disponible dans l'ID Token ou dans la réponse de UserInfo.

### Les scopes et les claims dans FranceConnect+

#### Liste des claims

##### Les données d'identité

<div class="fr-table">

| Claims       | Type   | Description                                                                                                                                                                 | Format                                                                                                                                                        |
| ------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| given_name   | string | les prénoms séparés par des espaces (standard OpenIDConnect)                                                                                                                | [A-Za-zÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸàâäçéèêëîïôöùûüÿÆŒæœ -']                                                                                                               |                                                                                                                                                                                                                              |
| family_name  | string | le nom de famille de naissance (standard OpenIDConnect)                                                                                                                     |   [A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒ \-']                                                                                                                                 |                                                                                                                                                                                                                              |
| birthdate    | string | la date de naissance au format YYYY-MM-DD (standard OpenIDConnect)                                                                                                          | [ YYYY-01-01 ] - (\d{4})-01-01 - (Présumé mois) [ YYYY-MM-01 ] - (\d{4})-(\d{2})-01 - (Présumé jours) [ YYYY-MM-DD ] - (\d{4})-(\d{2})-(\d{2})                |
| gender       | string | male pour les hommes, female pour les femmes (standard OpenIDConnect)                                                                                                       | Masculin : male Féminin : female                                                                                                                              |                                                                                                                                                                                                                              |
| birthplace   | string | le code INSEE du lieu de naissance sur 5 chiffres (ou une chaîne vide si la personne est née à l'étranger). Une lettre peut être présente pour les personnes nées en corse. | Si né en France (Taille de 5) [(([0-8][0-9AB])                                                                                                                | (9[0-8AB]))[0-9]{3}] - [Details](http://xml.insee.fr/schema/cog.html#CodeCommuneFrancaiseOuPaysOuTerritoireEtranger_stype) - [Liste](https://www.insee.fr/fr/information/3363419) <br/>En cas de pays étranger : Champs vide |     |
| birthcountry | string | le code INSEE du pays de naissance sur 5 chiffres                                                                                                                           |  Pour les pays étrangers (Taille de 5 ) [99[0-9]{3}] - [Details](http://xml.insee.fr/schema/cog.html#CodePaysOuTerritoireEtranger_stype) Pour la France 99100 |

</div>

#### Les données complémentaires

<div class="fr-table">

| Claims             | Type   | Description                                                               | Format                                                                           |
| ------------------ | ------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| sub                | string | identifiant technique (standard OpenIDConnect)                            | 66 caractères hexa + lettre 'v'                                                  |
| email              | string | l'adresse électronique de contact de la personne (standard OpenIDConnect) | [RFC 5322](https://xml2rfc.tools.ietf.org/public/rfc/html/rfc5322.html#addrspec) |
| preferred_username | string | le nom d'usage (standard OpenIDConnect)                                   |  [A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒ \-']                                                     |

</div>

#### Les données provenant du RNIPP

L'ensemble des données, hormis le sub, ci-dessus proviennent du fournisseur d'identité et ont le niveau de garantie correspondant ( substantiel ou élevé suivant le fournisseur d'identité ). Afin de faciliter la réconciliation entre les données d'identités mis à disposition par FranceConnect+ et les référentiels de certains FI ( fournisseurs de service publique exclusivement ), des données provenant du RNIPP peuvent également être mise à disposition en fonction du besoin. Attention, le RNIPP ne disposant pas de qualification en tant que MIE, les données provenant du RNIPP n'ont pas de garantie de niveau substantiel ou élevé. Il est donc nécessaire d'utiliser ces données afin de faciliter les réconciliations et uniquement cela. Les données provenant du fournisseurs d'identités doivent être utiliser pour garantir l'identité de l'usager.

<div class="fr-table">

| Claims             | Type   | Description                                                                                                                                                                 | Format                                                                                                                                                        |
| ------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| rnipp_given_name   | string | les prénoms séparés par des espaces (standard OpenIDConnect)                                                                                                                | [A-Za-zÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸàâäçéèêëîïôöùûüÿÆŒæœ -']                                                                                                               |                                                                                                                                                                                                                              |
| rnipp_family_name  | string | le nom de famille de naissance (standard OpenIDConnect)                                                                                                                     |   [A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒ \-']                                                                                                                                 |                                                                                                                                                                                                                              |
| rnipp_birthdate    | string | la date de naissance au format YYYY-MM-DD (standard OpenIDConnect)                                                                                                          | [ YYYY-01-01 ] - (\d{4})-01-01 - (Présumé mois) [ YYYY-MM-01 ] - (\d{4})-(\d{2})-01 - (Présumé jours) [ YYYY-MM-DD ] - (\d{4})-(\d{2})-(\d{2})                |
| rnipp_gender       | string | male pour les hommes, female pour les femmes (standard OpenIDConnect)                                                                                                       | Masculin : male Féminin : female                                                                                                                              |                                                                                                                                                                                                                              |
| rnipp_birthplace   | string | le code INSEE du lieu de naissance sur 5 chiffres (ou une chaîne vide si la personne est née à l'étranger). Une lettre peut être présente pour les personnes nées en corse. | Si né en France (Taille de 5) [(([0-8][0-9AB])                                                                                                                | (9[0-8AB]))[0-9]{3}] - [Details](http://xml.insee.fr/schema/cog.html#CodeCommuneFrancaiseOuPaysOuTerritoireEtranger_stype) - [Liste](https://www.insee.fr/fr/information/3363419) <br/>En cas de pays étranger : Champs vide |     |
| rnipp_birthcountry | string | le code INSEE du pays de naissance sur 5 chiffres                                                                                                                           |  Pour les pays étrangers (Taille de 5 ) [99[0-9]{3}] - [Details](http://xml.insee.fr/schema/cog.html#CodePaysOuTerritoireEtranger_stype) Pour la France 99100 |

</div>

#### Les données sur l'authentification

Les claims relatifs à l'authentification disponible par FranceConnect+ sont des claims standards et sont disponible uniquement dans l'ID Token. Ces claims sont les suivants :

- amr
- acr
- sid
- auth_time
- iss

[Plus d'informations sur ces claims](https://openid.net/specs/openid-connect-basic-1_0.html#IDToken)

#### Correspondance entre scope et claims sur FranceConnect+

Le tableau suivant décris la liste des _claims_ accessible en fonction des _scopes_ associés à l'access token.

<div class="fr-table">

| Scope                | Claims                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| openid               | sub                                                                                                                                                                            |
| gender               | gender                                                                                                                                                                         |
| birthdate            | birthdate                                                                                                                                                                      |
| birthcountry         | birthcountry                                                                                                                                                                   |
| birthplace           | birthplace                                                                                                                                                                     |
| given_name           | given_name                                                                                                                                                                     |
| family_name          | family_name                                                                                                                                                                    |
| email                | email                                                                                                                                                                          |
| preferred_username   | preferred_username                                                                                                                                                             |
| profile              | family_name, given_name, preferred_username, gender, birthdate                                                                                                                 |
| birth                | birthplace, birthcountry                                                                                                                                                       |
| identite_pivot       | given_name, family_name, birthdate, gender, birthplace, birthcountry                                                                                                           |
| rnipp_given_name     | given_name, rnipp_given_name                                                                                                                                                   |
| rnipp_family_name    | family_name, rnipp_family_name                                                                                                                                                 |
| rnipp_gender         | gender, rnipp_gender                                                                                                                                                           |
| rnipp_birthcountry   | birthcountry, rnipp_birthcountry                                                                                                                                               |
| rnipp_birthplace     | birthplace, rnipp_birthplace                                                                                                                                                   |
| rnipp_birthdate      | birthdate, rnipp_birthdate                                                                                                                                                     |
| rnipp_profile        | given_name, family_name, birthdate, gender,preferred_username,rnipp_given_name, rnipp_family_name, rnipp_birthdate, rnipp_gender                                               |
| rnipp_birth          | birthplace, birthcountry, rnipp_birthplace, rnipp_birthcountry                                                                                                                 |
| rnipp_identite_pivot | given_name, family_name, birthdate, gender, birthplace, birthcountry, rnipp_given_name, rnipp_family_name, rnipp_birthdate, rnipp_gender, rnipp_birthplace, rnipp_birthcountry |

</div>
