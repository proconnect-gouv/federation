---
key: fs-technique-eidas-identite
title: Quelles sont les données d'identités d'un usager provenant d'un pays européens via la noeud eIDAS français ?
layout: layouts/page.doc.njk
segments:
  [
    { url: '/fs/', title: 'Fournisseurs de services' },
    { url: '/fs/technique/', title: 'Documentation technique' },
  ]
tags:
  - FranceConnect+
  - eIDAS
category: 'fs-technique'
abstract: "Les données d'identités que vous pouvez récupérer d'un usager provenant d'un autre état membre sont différentes d'un usager français. Vous allez notamment récupérer les informations suivantes : nom d'usage, prénoms, sexe, date de naissance et lieu de naissance."
seealso:
  - fs-technique-scope
  - fs-projet-eidas-noeud
  - fs-technique-acr
order: 70
---

Il est possible de permettre aux usagers des autres pays européens d'accéder à votre service en s'authentifiant avec le schéma d'identification de leur pays.

Pour votre service, cela se passe en utilisant la plateforme FranceConnect+.

### Quelles sont les données d'identité accessible pour un usager européen ?

<div class="fr-table">

| Claim        | Obligatoire | Commentaire                                                                              |
| ------------ | ----------- | ---------------------------------------------------------------------------------------- |
|  openid      | X           | même format que pour une identité française                                              |
|  gender      |             | `male`, `female` ou `unspecified`                                                        |
|  birthdate   | X           | même format que pour une identité française, ne gère pas les présumés nées               |
|  birthplace  |             | Ne correspond pas à un COG. Le format est libre pour chaque pays.                        |
|  given_name  | X           | Correspond au prénom de la personne. Ce n'est pa obligatoirement le prénom de naissance. |
|  family_name | X           | Contient le nom d'usage de la personne                                                   |

</div>

### Comment savoir s'il s'agit d'une identité provenant d'un fournisseur d'identité français ou d'une identité européenne ?

Cette information est indiqué dans le claim _amr_ qui peut contenir plusieurs valeurs. Il est nécessaire de demander cette information via la demande du claim spécifique _amr_.

<div class="fr-table">

| Valeur | Origine de l'identité                                     |
| ------ | --------------------------------------------------------- |
| fr     | identité provenant d'un fournisseur d'identité français   |
| eidas  | identité provenant d'un schéma d'identité d'un autre pays |

**Attention :** Le claim _amr_ peut contenir des valeurs supplémentaires correspondant aux méthodes d'authentificiation utiliser par le fournisseur d'identité. Celui contiendra alors un tableau de valeur contenant l'ensemble des méthodes d'authentification ainsi que l'origine de l'identité.

</div>
