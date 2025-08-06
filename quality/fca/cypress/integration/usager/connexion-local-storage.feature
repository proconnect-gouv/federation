#language: fr
Fonctionnalité: Connexion avec LocalStorage
  
  Scénario: Connexion avec LocalStorage - avec case "se souvenir de moi" cochée puis décochée
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "<email>"
    Et que je clique sur la checkbox "se souvenir de moi"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "<idpDescription>"
    Quand je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Alors le champ email correspond à "<email>"
    Quand je clique sur la checkbox "se souvenir de moi"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "<idpDescription>"
    Quand je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Alors le champ email correspond à ""

    Exemples:
      | email                        | idpDescription |
      | albus.dumbledore@hogwarts.uk | moncomptepro   |
      | albus.dumbledore@fia1.fr     | par défaut     |

  Scénario: Connexion avec LocalStorage - avec case "se souvenir de moi" décochée
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "<email>"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "<idpDescription>"
    Quand je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Alors le champ email correspond à ""

    Exemples:
      | email                        | idpDescription |
      | albus.dumbledore@hogwarts.uk | moncomptepro   |
      | albus.dumbledore@fia1.fr     | par défaut     |
