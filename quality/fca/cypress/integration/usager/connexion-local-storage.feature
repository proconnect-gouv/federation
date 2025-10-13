#language: fr
Fonctionnalité: Connexion avec LocalStorage

  @ignoreInteg01
  Plan du Scénario: Case "se souvenir de moi" cochée puis décochée
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "<email>"
    Et que je clique sur la checkbox "se souvenir de moi"
    Quand je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "<idpDescription>"
    Alors la page du FI affiche remember_me "true"
    Quand je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Alors le champ email correspond à "<email>"
    Quand je clique sur la checkbox "se souvenir de moi"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "<idpDescription>"
    Alors la page du FI affiche remember_me "false"
    Quand je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Alors le champ email correspond à ""

    Exemples:
      | email                        | idpDescription |
      | albus.dumbledore@hogwarts.uk | moncomptepro   |
      | albus.dumbledore@fia1.fr     | par défaut     |

  @ignoreDocker
  Scénario: Case "se souvenir de moi" cochée puis décochée
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "albus.dumbledore@fia1.fr"
    Et que je clique sur la checkbox "se souvenir de moi"
    Quand je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Alors la page du FI affiche remember_me "true"
    Quand je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Alors le champ email correspond à "albus.dumbledore@fia1.fr"
    Quand je clique sur la checkbox "se souvenir de moi"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Alors la page du FI affiche remember_me "false"
    Quand je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Alors le champ email correspond à ""

  Scénario: Case "se souvenir de moi" décochée
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "albus.dumbledore@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Alors la page du FI affiche remember_me "false"
    Quand je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Alors le champ email correspond à ""

  Scénario: Case "se souvenir de moi" puis login_hint
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "albus.dumbledore@fia1.fr"
    Et que je clique sur la checkbox "se souvenir de moi"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Quand je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert le login_hint "severus.snape@fia2.fr"
    Et que je clique sur le bouton ProConnect
    Alors le champ identifiant correspond à "severus.snape@fia2.fr"
    Et la page du FI affiche remember_me "false"
    Quand je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Alors le champ email correspond à "albus.dumbledore@fia1.fr"
