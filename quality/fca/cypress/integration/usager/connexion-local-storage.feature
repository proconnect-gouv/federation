#language: fr
Fonctionnalité: Connexion avec LocalStorage

  Plan du Scénario: Connexion avec LocalStorage - avec email et interruption
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "<email>"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "<idpDescription>"
    Quand je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Alors le champ email correspond à "<email>"
    Et je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "<idpDescription>"

    Exemples:
      | email                        | idpDescription |
      | albus.dumbledore@hogwarts.uk | moncomptepro   |
      | albus.dumbledore@fia1.fr     | par défaut     |
