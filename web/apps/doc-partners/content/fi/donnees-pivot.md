---
title: Les données d'un usager
layout: layouts/page.njk
eleventyNavigation:
  order: 3
  key: donnees-usager-fi
  title: Les données d'un usager
  parent: Fournisseurs d'identité
---

# Les données d'un usager

Le fournisseur d'identité doit mettre à disposition de l'usager des informations d'identités de l'usager à FranceConnect ou FranceConnect+ via les mécanismes standards d'OpenId Connect. 

Celles-ci vont permettre à FranceConnect et FranceConnect d'identifier l'usager, de réaliser un certain nombre de contrôle et de transmettre au fournisseur de service les données de l'usage dont il a besoin. 

Ces données 

### L'identité pivot

L'identité pivot fait partie des données usagers fournies par les Fournisseurs d'Identité aux Fournisseurs de Service, via FranceConnect et FranceConnect+. Elle permet d'identifier un utilisateur particulier.

<div class="fr-table">

| Claim        | Obligatoire | Type   | Description                                                                                                |
|--------------|-------------|--------|------------------------------------------------------------------------------------------------------------|
| given_name   | oui         | string | les prénoms séparés par des espaces (standard OpenIDConnect)                                               |
| family_name  | oui         | string | le nom de famille de naissance (standard OpenIDConnect)                                                    |
| birthdate    | oui         | string | la date de naissance au format YYYY-MM-DD (standard OpenIDConnect), au format YYYY-MM-00 ou YYYY-00-00 pour les présumés nés                                         |
| gender       | oui         | string | male pour les hommes, female pour les femmes (standard OpenIDConnect)                                      |
| birthplace   | oui         | string | le code INSEE du lieu de naissance sur 5 chiffres (ou une chaîne vide si la personne est née à l'étranger) |
| birthcountry | oui         | string | le code INSEE du pays de naissance sur 5 chiffres                                                          |

</div>

### Les données complémentaires

En complément des données de l'identité pivot, le fournisseur d'identité doit fournir des données complémentaire sur l'usager. 

<div class="fr-table">

| Claims             | Obligatoire | Type   | Description                                                               |
|--------------------|-------------|--------|---------------------------------------------------------------------------|
| sub                | oui         | string | identifiant technique (standard OpenIDConnect)                            |
| email              | oui         | string | l'adresse électronique de contact de la personne (standard OpenIDConnect) |
| preferred_username | non         | string | le nom d'usage (standard OpenIDConnect)                                   |

</div>