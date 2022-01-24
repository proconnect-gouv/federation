#language: fr
@usager @connexionUsager
Fonctionnalité: Connexion Usager
  # En tant qu'usager d'un fournisseur de service,
  # je veux me connecter en utilisant un fournisseur d'identité
  # afin d'accéder à mon service

  Scénario: Deconnexion d'un usager
    Etant donné que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton AgentConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que j'utilise un fournisseur d'identité "actif"
    Quand je cherche le fournisseur d'identité par son ministère
    Et je clique sur le fournisseur d'identité
    Et je suis redirigé vers la page login du fournisseur d'identité
    Et je m'authentifie avec succès
    Alors je suis redirigé vers la page fournisseur de service
    Et je suis connecté
    Quand je me déconnecte du fournisseur de service
    Alors je suis déconnecté du fournisseur d'identité
    Et la session FC est détruite
    Et je suis déconnecté du fournisseur de service
