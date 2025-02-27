#language: fr
Fonctionnalité: Connexion Usager - Token

  # todo: debug this test and restore it
  # we have commented this test because we cannot prioritize its debug
  # and we don't want to take the habit to valid the staging CI with a
  # failing test
  @ignoreInteg01
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
