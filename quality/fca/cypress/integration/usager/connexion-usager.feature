#language: fr
Fonctionnalité: Connexion Usager - Redirection vers FI avec email
  Plan du Scénario: Connexion d'un usager - fqdn <idpDescription>
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "<email>"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "<idpDescription>"
    Et je m'authentifie
    Alors je suis connecté au fournisseur de service

    Exemples:
      | email                  | idpDescription |
      | iknowthisemail@fia1.fr | par défaut     |
      | iknowthisemail@FIA1.fr | par défaut     |
      | iknowthisemail@fia2.fr | différent      |

    @ignoreInteg01
    Exemples:
      | email                        | idpDescription |
      | albus.dumbledore@hogwarts.uk | moncomptepro   |

  @ignoreDocker
  Plan du Scénario: Connexion d'un usager - fqdn <idpDescription> (redirection vers FI seulement)
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "<email>"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "<idpDescription>"

    Exemples:
      | email                               | idpDescription |
      | albus.dumbledore@hogwarts.uk        | moncomptepro   |
      | hades@developpement-durable.gouv.fr | cerbere        |

  @ignoreInteg01
  Scénario: Connexion d'un usager - fqdn non reconnu et non service public
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "albus.dumbledore@hogwarts.uk"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "moncomptepro"
    Et j'utilise un compte usager privé
    Et je m'authentifie
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500015"

  @ignoreInteg01
  Scénario: Connexion d'un usager - fqdn non reconnu et non service public mais FS acceptant le privé
    Etant donné que je navigue sur la page fournisseur de service "acceptant le privé"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "albus.dumbledore@hogwarts.uk"
    Quand je clique sur le bouton de connexion
    Et j'utilise un compte usager privé
    Et je m'authentifie
    Alors je suis redirigé vers la page fournisseur de service "acceptant le privé"

  @ignoreInteg01
  Scénario: Connexion d'un usager - retour en arrière après redirection vers FI
    Etant donné que je navigue sur la page fournisseur de service "par défaut"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "batman@fia1.fr"
    Quand je clique sur le bouton de connexion
    Quand je reviens en arrière
    Alors je suis redirigé vers la page interaction
