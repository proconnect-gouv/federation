#language: fr
Fonctionnalité: Connexion Usager - Scope
  Plan du Scénario: Connexion d'un usager - scope <scopeType>
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert l'accès aux informations des scopes "<scopeType>"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand je m'authentifie
    Alors le fournisseur de service "par défaut" a accès aux informations des scopes "<scopeType>" en provenance du FI "par défaut"

    Exemples:
      | scopeType                                 |
      | tous les scopes                           |

    @ignoreInteg01
    Exemples:
      | scopeType                                 |
      | obligatoires                              |
      | obligatoires et siren/siret               |
      | obligatoires et organizational_unit/phone |
      | obligatoires et belonging_population      |
      | obligatoires et idp_id                    |
      | obligatoires et idp_acr                   |
      | email                                     |
      | chorusdt                                  |

  @ignoreInteg01
  Scénario: Connexion d'un usager - scope anonyme
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert l'accès aux informations du scope "anonyme"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand je m'authentifie
    Alors le fournisseur de service "par défaut" a accès aux informations du scope "anonyme" en provenance du FI "par défaut"

  @ignoreInteg01
  Scénario: Connexion d'un usager - attribut scope inconnu ignoré
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert l'accès aux informations des scopes "email avec scope inconnu"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand je m'authentifie
    Alors le fournisseur de service "par défaut" a accès aux informations des scopes "email" en provenance du FI "par défaut"

  @ignoreInteg01
  Scénario: Connexion d'un usager - erreur scope vide
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert l'accès aux informations des scopes "vide"
    Quand je clique sur le bouton ProConnect
    Et je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y000400"

  @ignoreInteg01
  Scénario: Connexion d'un usager - erreur scope openid manquant
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert l'accès aux informations des scopes "obligatoires sans openid"
    Quand je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page erreur du fournisseur de service
    Et le titre de l'erreur fournisseur de service est "invalid_request"
    Et la description de l'erreur fournisseur de service est "openid%20scope%20must%20be%20requested%20when%20using%20the%20claims%20parameter"

  @ignoreInteg01
  Scénario: Connexion d'un usager - erreur FS non habilité pour ce scope
    Etant donné que je navigue sur la page fournisseur de service "non habilité à demander le scope belonging_population"
    Et que le fournisseur de service requiert l'accès aux informations des scopes "obligatoires et belonging_population"
    Quand je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page erreur du fournisseur de service
    Et le titre de l'erreur fournisseur de service est "invalid_scope"
    Et la description de l'erreur fournisseur de service est "requested%20scope%20is%20not%20allowed"
