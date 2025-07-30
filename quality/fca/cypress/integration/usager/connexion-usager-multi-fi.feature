#language: fr
Fonctionnalité: Connexion Usager dont le fqdn est lié à plusieurs fi

  Plan du Scénario: Connexion d'un usager au FI <idpLabel> docker
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert l'accès aux informations du scope "<scope>"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "many@polyfi.fr"
    Quand je clique sur le bouton de connexion
    Alors je suis redirigé vers la page permettant la selection d'un fournisseur d'identité
    Quand je choisis le fournisseur d'identité "<idpLabel>"
    Et je suis redirigé vers la page login du fournisseur d'identité "<idpName>"
    Et je m'authentifie
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service
    Et le fournisseur de service "par défaut" a accès aux informations du scope "<scope>" en provenance du FI "<idpName>"

    @ignoreInteg01
    Exemples:
      | idpLabel                                   | idpName    | scope           |
      | Identity Provider 1 - eIDAS faible - ES256 | par défaut | tous les scopes |
      | Identity Provider 2 - eIDAS faible - RS256 | second FI  | tous les scopes |

    @ignoreDocker
    Exemples:
      | idpLabel                    | idpName    | scope           |
      | Identity Provider 1 - HS256 | par défaut | tous les scopes |
      | Identity Provider 2 - ES256 | second FI  | tous les scopes |

  Scénario: Connexion d'un usager - fournisseur d'identité autre
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "many@polyfi.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page permettant la selection d'un fournisseur d'identité
    Et je choisis le fournisseur d'identité "Autre"
    Alors je suis redirigé vers la page login du fournisseur d'identité "moncomptepro"

  @ignoreInteg01
  Scénario: Connexion d'un usager - retour en arrière après redirection vers FI
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "many@polyfi.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page permettant la selection d'un fournisseur d'identité
    Et je choisis le fournisseur d'identité "Identity Provider 1 - eIDAS faible - ES256"
    Et je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Quand je reviens en arrière
    Alors je suis redirigé vers la page permettant la selection d'un fournisseur d'identité
    Quand je reviens en arrière
    Alors je suis redirigé vers la page interaction

  @ignoreInteg01
  Scénario: Connexion d'un usager - FI par défaut est accepté par tous les fqdnToIdp
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "many@polyfi.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page permettant la selection d'un fournisseur d'identité
    Alors le fournisseur d'identité "Autre" est affiché

  @ignoreInteg01
  Scénario: Connexion d'un usager - FI par défaut n'est pas accepté par l'un des fqdnToIdp
    Etant donné que je navigue sur la page fournisseur de service "par défaut"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "many@polyfi2.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page permettant la selection d'un fournisseur d'identité
    Alors le fournisseur d'identité "Autre" n'est pas affiché
