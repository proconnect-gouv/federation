#language: fr
Fonctionnalité: Fournisseur Données

  @ignoreInteg01
  Scénario: Checktoken - access token valide avec un scope groups
    Etant donné que je navigue sur la page fournisseur de service "éligible au scope groups"
    Et que le fournisseur de service requiert l'accès aux informations des scopes "obligatoires et groups"
    Et que le fournisseur de service requiert un acr_values à "eidas1"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Quand le fournisseur de service demande l'accès aux données au fournisseur de données
    Alors le fournisseur de données vérifie l'access token fourni par le fournisseur de service
    Et le checktoken endpoint envoie un token d'introspection valide
    Et le token d'introspection a une propriété "acr" égale à "eidas1"
    Et le token d'introspection a une propriété "scope" égale à "groups"
    Et le token d'introspection a une propriété "aud" avec le client_id du fournisseur de service "éligible au scope groups"
    Et le token d'introspection a une propriété "iat" avec le timestamp de création de l'access token
    Et le token d'introspection a une propriété "exp" avec le timestamp d'expiration de l'access token

  Scénario: Checktoken - access token expiré
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Quand je révoque le token ProConnect
    Et le fournisseur de service demande l'accès aux données au fournisseur de données
    Alors le fournisseur de données vérifie l'access token fourni par le fournisseur de service
    Et le checktoken endpoint envoie un token d'introspection expiré

  Scénario: Checktoken - access token aucun scope ne correspond au FD
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert l'accès aux informations des scopes "obligatoires"
    Et que le fournisseur de service requiert un acr_values à "eidas1"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Quand le fournisseur de service demande l'accès aux données au fournisseur de données
    Alors le fournisseur de données vérifie l'access token fourni par le fournisseur de service
    Et le checktoken endpoint envoie un token d'introspection valide
    Et le token d'introspection a une propriété "scope" égale à ""
