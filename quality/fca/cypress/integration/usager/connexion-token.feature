#language: fr
@usager @token @ci
Fonctionnalité: Connexion Usager - Token
  # En tant qu'usager,
  # je souhaite que mes données de session soient accessibles tant que mon token est valide
  # afin de continuer à utiliser mes données depuis mon fournisseur de service

  Scénario: Token non valide après révocation
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Quand je révoque le token ProConnect
    Et le token ProConnect est révoqué
    Et je redemande les informations de l'usager
    Alors je vois l'erreur "WWWAuthenticateChallengeError"
