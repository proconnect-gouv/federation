---
title: Rôle d'un fournisseur d'identité
layout: layouts/page.njk
eleventyNavigation:
  order: 1
  key: Rôle d'un fournisseur d'identité
  parent: Fournisseurs d'identité
---


## Quel est le rôle d'un fournisseur d'identité ? 

Le rôle d'un fournisseur d'identité est d'**authentifier** et d'**identifier** les usagers pour leur permettre d'accéder à leurs services au travers de FranceConnect ou de FranceConnect+. 



### Identification d'un usager

L'identification permet de répondre à la question *"Qui est l'usager ?"* . 

Le fournisseur d'identité doit vérifier l'identité de lusager lors de l'enregistrement de ce dernier. En fonction des niveaux de garantie sur l'identité, la vérification pourra être plus ou moins poussée. 

C'est le rôle du fournisseur d'identité de vérifier l'identité de l'usager et de transmettre celles-ci à FranceConnect ou FranceConnect+. Les données d'identités d'un usager sont les suivantes : 
- le nom de naissance
- les prénoms
- la date de naissance
- le sexe
- le lieu de naissance (pays + ville)
- le nom d'usage
- l'adresse email de l'usager

### Authentification de l'usager

L'authentification permet de répondre à la question *"L'usager est-il celui qu'il prétend être ?"*. 

Pour cela, l'usager doit alors prouver qui il est. Il existe trois type de facteurs d'authentification pour cela : 
- **Connaissance - ce que je connais :** il s'agit d'information que seul l'isager connait comme un mot de passe, un code PIN ou des réponses à des questions de sécurité. 
- **Possession - ce que je possède :** il s'agit de ce que possède l'usager comme un smartphone, un jeton physique, une clé, ...
- **Biométrie - ce qui m'est propre :** il s'agit de trait physique de l'usagers, comme les empreintes digitales, la reconnaissance vocale, la reconnaissance faciale, ...

On parle d'authentification multi-facteurs lorsqu'il y a une combinaison de plusieurs types de facteurs, comme un facteur de connaissance et un facteur de de possession par exemple. 

[Plus d'informations](https://www.ssi.gouv.fr/uploads/2021/10/anssi-guide-authentification_multifacteur_et_mots_de_passe.pdf)

### Niveau de garantie de l'identité

Le niveau de garantie eIDAS permettre d'apporter une garantie sur l'identité qui est fournie au Fournisseur de Service. Ils sont définis par le règlement eIDAS avec chacun des exigences différentes. 

- **Faible :** à ce niveau, l’objectif est simplement de réduire le risque d’utilisation abusive ou d’altération de l’identité ;
- **Substantiel :** à ce niveau, l’objectif est de réduire substantiellement le risque d’utilisation abusive ou d’altération de l’identité ;
- **Élevé :** à ce niveau, l’objectif est d’empêcher l’utilisation abusive ou l’altération de l’identité.

Source : [Présentation du règlement eIDAS par l'ANSSI](https://www.ssi.gouv.fr/administration/reglementation/confiance-numerique/le-reglement-eidas/#:~:text=Substantiel%20%3A%20%C3%A0%20ce%20niveau%2C%20l,'alt%C3%A9ration%20de%20l'identit%C3%A9.)

Le détail des exigeances est défini par [le règlement d’exécution n°2015/1502 du 8 septembre 2015](http://eur-lex.europa.eu/legal-content/FR/TXT/PDF/?uri=CELEX:32015R1502&from=FR)

