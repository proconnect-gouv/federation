---
key: fs-projet-donnees-identites
title: Quelles sont les données que je peux récupérer par FranceConnect ou FranceConnect+ sur mes usagers ?
layout: layouts/page.doc.njk
tags:
  - FranceConnect
  - FranceConnect+
segments:
  [
    { url: '/fs/', title: 'Fournisseurs de services' },
    { url: '/fs/projet/', title: 'Intégration de FranceConnect ou FranceConnect+ à mon service' },
  ]
category: fs-projet
abstract: Il et possible de récupérer les données d'identités de l'usager (nom de naissance, nom d'usage, prénoms, sexe, date de naissance, lieu de naissance, adresse email) ainsi que des données supplémentaires via les fournisseurs de données.
seealso:
  - fs-projet-datapass
  - fs-projet-sub
  - fs-technique-scope
  - fs-technique-eidas-identite
---

### Données d'identités

Les données usagers sont fournies par les Fournisseurs d'Identité aux Fournisseurs de Service, via FranceConnect ou FranceConnect+, conformément à l'habilitation obtenue via [datapass.api.gouv.fr](https://datapass.api.gouv.fr), et le choix des données réalisé par le fournisseur de service dans cette demande.

L'identité pivot permet d'identifier un utilisateur particulier.

- **Nom de naissance**
- **Prénoms**
- **Sexe**
- **Date de naissance**
- **[Code géographique INSEE de la ville de naissance](https://www.insee.fr/fr/information/2560452)**
- **[Code géographique INSEE du pays de naissance](https://www.insee.fr/fr/information/2560452)**

En complément, il est possible d'obtenir le **nom d'usage**. Cependant cette donnée n'est pas obligatoirement connue par tous les Fournisseurs d'Identité. Cette donnée ne sera donc pas transmise systématiquement si vous la demandez.

Vous pouvez avoir accès également à l'**adresse email**. Cette donnée de contact a également été vérifiée par le Fournisseur d'identité. Il est à remarquer que la donnée "adresse email" peut différer selon le Fournisseur d'Identité choisi par l'usager.

FranceConnect et FranceConnect+ transmettent systématiquement au Fournisseur de Service un **identifiant unique (sub)** pour chaque utilisateur :

- Cet identifiant est spécifique à chaque Fournisseur de Service. Un même utilisateur aura donc un identifiant unique différent pour chacun des Fournisseurs de Service auxquels il accède.
- Cet identifiant est le même quelque soit le Fournisseur d'Identité qui est utilisé par l'utilisateur.
- Cet identifiant n'est amené à changer quand dans le cas particulier où l'utilisateur a fait modifié ses données d'état civil. Dans tous les autres cas, cet identifiant sera systématiquement le même.

#### Provenance des données d'identité

##### FranceConnect

Les données transmises par FranceConnect au fournisseur de service proviennent du _Référentiel National d'Identification des Personnnes Physiques (RNIPP)_. Ainsi, quelque soit le fournisseur d'identité utilisé par l'usager pour l'authentifier et s'identifier, les données transmises au fournisseur de service sont les mêmes.

##### FranceConnect+

Les données d'identité fournies au fournisseur de service par FranceConnect+ sont celles directement issues du fournisseur d'identité choisi par l'utilisateur. Ces données peuvent donc légèrement varier d'un fournisseur d'identité à l'autre, nous préconisons donc de réaliser le rapprochement/réconciliation sur la base de l'identifiant unique de l'utilisateur fourni par FranceConnect+. Il est également possible de récupérer des données provenant du RNIPP en complément des données d'identités provenant du fournisseur d'identité. Cependant, ces données ne disposent pas du niveau de garantie substantiel ou élevé et doivent être utilisé uniquement pour faciliter le rapprochement/réconciliation.

### Les fournisseurs de données

Il est également possible de récupérer des données supplémentaires sur l'usager mis à disposition par les fournisseurs de données. Ces données sont mises à disposition par des autres administrations.

[Plus d'informations](https://api.gouv.fr/guides/api-franceconnectees)

:::callout En Bref

Il et possible de récupérer les données d'identités de l'usager (**nom de naissance**, **nom d'usage**, **prénoms**, **sexe**, **date de naissance**, **lieu de naissance**, **adresse email**) ainsi que des données supplémentaires via les **fournisseurs de données**.

:::
