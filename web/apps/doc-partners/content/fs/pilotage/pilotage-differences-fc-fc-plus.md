---
key: fs-pilotage-diff-fc-fc-plus
title: Quelles sont les différences entre FranceConnect et FranceConnect+ ?
layout: layouts/page.doc.njk
tags:
  - FranceConnect
  - FranceConnect+
segments:
  [
    { url: '/fs/', title: 'Fournisseurs de services' },
    { url: '/fs/pilotage', title: 'Fonctionnement général de FranceConnect et FranceConnect+' },
  ]
category: fs-pilotage
abstract: 'La principale différence entre FranceConnect et FranceConnect+ est le niveau de garantie eIDAS supporté par la plateforme'
seealso:
  - fs-eidas-loa
  - fs-projet-datapass
  - fs-pilotage-modele-economique
---

### Les niveaux de garantie sur l'identité délivrée

La principale différences entre FranceConnect et FranceConnect+ est le niveau de garantie eIDAS supporté par la plateforme. Pour rappel, le règlement eIDAS prévoit trois niveau de garantie :

> - Faible : à ce niveau, l’objectif est simplement de réduire le risque d’utilisation abusive ou d’altération de l’identité ;
> - Substantiel : à ce niveau, l’objectif est de réduire substantiellement le risque d’utilisation abusive ou d’altération de l’identité ;
> - Élevé : à ce niveau, l’objectif est d’empêcher l’utilisation abusive ou l’altération de l’identité.

[[plus d'infos](https://www.ssi.gouv.fr/administration/reglementation/confiance-numerique/le-reglement-eidas/)]

La plateforme FranceConnect supporte uniquement le niveau de garantie faible. C'est la plateforme FranceConnect+ qui assurent les niveaux de garantie supérieur, c'est à dire les niveaux de garantie Substantiel et Élevé.

<div class="fr-table">

| Plateforme     | Niveau de garantie eIDAS |
| -------------- | ------------------------ |
| FranceConnect  | faible                   |
| FranceConnect+ | substantiel et élevé     |

</div>

### La liste des fournisseurs d'identité disponible

FranceConnect+ ne pouvant délivrer que des identités de niveau substantiel ou élevé, les fournisseurs d'identités ne délivrant pas d'identité sur ces niveaux ne sont pas utilisable par l'utilisateur. Ainsi, les fournisseurs d'identités Impots.gouv.fr, Ameli.fr et MSA n'ayant pas pour vocation à délivrer des identités avec des niveaux de garantie autre que faible ne seront jamais disponible sur FranceConnect+.

Dans le but de simplifier l'expérience utilisateur, l'ensemble des fournisseurs d'identités disponible sur FranceConnect+ seront également disponible sur FranceConnect.

D'autres comme France Identité ou Yris devrait arriver à terme sur FranceConnect+.

<div class="fr-table">

| Fournisseur d'identité        | FranceConnect | FranceConnect+ |
| ----------------------------- | ------------- | -------------- |
| Impots.gouv.fr                | Oui           | Non            |
| Ameli.fr                      | Oui           | Non            |
| MSA                           | Oui           | Non            |
| L'identité numérique La Poste | Oui           | Oui            |
| Yris                          | Oui           | A venir        |
| Impots.gouv.fr                | Oui           | A venir        |

</div>

### Les démarches cibles

FranceConnect+ est destiné à des démarches en ligne ou service sensibles, manipulant des données de santés, ou permettant la réalisation de transactions financiaires. FranceConnect est destiné aux démarches en ligne ou services non sensible.

### Le modèle de facturation

FranceConnect+ tout comme FranceConnect reste gratuit pour l'ensemble des fournisseurs de service. Cependant, l'usage des identités fournies par des acteurs privés via FranceConnect+ peut être facturés par ces derniers pour les fournisseurs de services privés. Ces derniers devront contractualiser avec l'ensemble des fournisseurs d'identités privés.

L'usage des identités via FranceConnect reste gratuit, quelque soit le fournisseur d'identité utilisé par l'usager.

### Une implémentation technique spécifique

Des mesures de sécurités supplémentaire ont été mise en place sur FranceConnect+ afin de pouvoir délivrier des identité ayant des niveaux de garantie susbtantiel ou élevé. Tout comme FranceConnect, FranceConnect+ se base sur le protocole OpenID Connect, mais des choix différents ont été réalisés, notamment sur le chiffrement et la signature des données lors de l'envoi des données d'identités des usagers.

:::callout En bref
**FranceConnect** c'est :

- destiné aux **démarches** en lignes **non sensibles**
- des **identités** ou comptes avec un **niveau de sécurité suffisant** pour des **démarches non sensibles**
- **gratuit** pour l'ensemble des fournisseurs de services

**FranceConnect+** c'est :

- destiné aux **démarches** en ligne **sensible**
- des **identités** numériques **plus sécurisées**
- **payant** pour les fournisseurs de **services privés**
- une implémentation proche de FranceConnect avec des **mesures de sécurités supplémentaires**
  :::
