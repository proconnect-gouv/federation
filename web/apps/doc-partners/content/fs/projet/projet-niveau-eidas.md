---
key: fs-eidas-loa
title: Qu'est ce qu'eIDAS et quels sont les niveaux de garantie de FranceConnect et FranceConnect+ ?
layout: layouts/page.doc.njk
tags:
  - FranceConnect
  - FranceConnect+
  - eIDAS
segments:
  [
    { url: '/fs/', title: 'Fournisseurs de services' },
    { url: '/fs/projet/', title: 'Intégration de FranceConnect ou FranceConnect+ à mon service' },
  ]
category: fs-projet
abstract: 'Les niveaux de garanties eIDAS permettent de définir le niveau de sécurité associé à une identité numérique : faible, susbtantiel et élevé.'
seealso:
  - fs-projet-eidas-cinematique
  - fs-projet-eidas-noeud
  - fs-pilotage-diff-fc-fc-plus
  - fs-pilotage-fi
---

### Qu'est ce que le règlement eIDAS ?

Le règlement n° 910/2014 sur l'identification électronique et les services de confiance pour les
transactions électroniques au sein du marché intérieur, dit règlement « eIDAS », est un règlement
européen qui a été adopté le 23 juillet 2014 par le Parlement européen et le Conseil de l'Union
Européenne. L'objectif de ce règlement est de mettre en place un cadre juridique propre à
susciter une confiance accrue dans les transactions électroniques au sein du marché intérieur.

Le règlement eIDAS s'applique à l’identification électronique et aux services de confiance
(faisant respectivement l’objet des chapitres II et III du présent document). Il accorde également
un effet juridique aux documents électroniques.

_Source : [FAQ eIDAS de l'ANSSI](https://www.ssi.gouv.fr/uploads/2017/01/eidas_faq_anssi.pdf)_

FranceConnect+ est concerné uniquement par le volet identification électronique du règlement.

### Qu'est ce que les niveaux de garantie eIDAS ?

Le niveau de garantie eIDAS permettre d'apporter une garantie sur l'identité qui est fournie au Fournisseur de Service. Ils sont définis par le règlement eIDAS avec chacun des exigences différentes.

- **Faible :** à ce niveau, l’objectif est simplement de réduire le risque d’utilisation abusive ou d’altération de l’identité ;
- **Substantiel :** à ce niveau, l’objectif est de réduire substantiellement le risque d’utilisation abusive ou d’altération de l’identité ;
- **Élevé :** à ce niveau, l’objectif est d’empêcher l’utilisation abusive ou l’altération de l’identité.

_Source : [Présentation du règlement eIDAS par l'ANSSI](https://www.ssi.gouv.fr/administration/reglementation/confiance-numerique/le-reglement-eidas/#:~:text=Substantiel%20%3A%20%C3%A0%20ce%20niveau%2C%20l,'alt%C3%A9ration%20de%20l'identit%C3%A9.)_

Le détail des exigeances est défini par [le règlement d’exécution n°2015/1502 du 8 septembre 2015](http://eur-lex.europa.eu/legal-content/FR/TXT/PDF/?uri=CELEX:32015R1502&from=FR)

### Quels sont les niveaux de garantie eIDAS des identités délivrées par FranceConnect et FranceConnect+ ?

#### FranceConnect

FranceConnect délivre des identités de niveau faible aux fournisseurs de service, quelque soit le fournisseur d'identité utilisés.

Parmi la liste des fournisseurs d'identité disponible via FranceConnect, certains sont succeptible de délivrer des identités avec des niveaux de garantie susbtantiel ou élevé. Cependant, celles-ci seront transmises au fournisseur de service avec un niveau de garantie faible. Pour pouvoir délivrer des identitésfs-projet-eidas-noeud avec des niveaux de garanties de niveau susbtantiel ou élevé, il faut que l'ensemble de la chaine d'authentification, c'est-à-dire le fournisseur d'identité et FranceConnect, soit qualifié pour ces niveaux.

FranceConnect n'était pas qualifié pour délivrer des identités avec des niveaux de garantie susbtantiel et élevé, les identités délivrés seront rabaissés au niveaux de garantie faible.

#### FranceConnect+

FranceConnect+ a été qualifié par l'ANSSI pour le niveau élevé en tant que moyen d'identité électronique, c'est à dire que FranceConnect+ répond aux exigences pour permette d'apporter un niveau de garantie élevé en tant que moyen d'identification électronique. A ce titre, FranceConnect+ apparait dans la [liste des produits qualifiés par l'ANSSI](https://www.ssi.gouv.fr/uploads/liste-produits-et-services-qualifies.pdf) dans la section _moyen d'identification électronique_.

Cependant, afin de pouvoir garantir un niveau élevé, il faut également que les Fournisseurs d'Identité soit également qualifié pour ce ce niveau.

Actuellement, FranceConnect+ ne dispose que d'un seul Fournisseur d'Identité, L'identité Numérique La Poste, qui est qualifié pour le niveau substantiel par l'ANSSI. Ainsi, actuellement la plateforme FranceConnect+ ne peut délivrer des identités avec uniquement le niveau de garantie substantiel même si FranceConnect+ est déjà prêt pour délivrer des identités avec le niveau de garantie élevé.

Le tableau ci-dessous récapitule les niveaux supportés par les deux plateformes FranceConnect et FranceConnect+.

<div class="fr-table">

| Niveau de garantie | FranceConnect | FranceConnect+ |
| ------------------ | ------------- | -------------- | --- |
| faible             |  Oui          |  Non           |     |
| substantiel        |  Non          |  Oui           |     |
| élevé              |  Non          |  Oui           |

</div>

:::callout En bref
Les niveaux de garanties eIDAS permettent de définir le niveau de sécurité associé à une identité numérique : faible, susbtantiel et élevé.

Seul FranceConnect+ permet de délivrer des identités de niveau susbtantiel ou élevé.
:::
