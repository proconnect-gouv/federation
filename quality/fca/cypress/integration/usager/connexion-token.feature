#language: fr
Fonctionnalité: Connexion Usager - Token

  # We only check the `WWWAuthenticateChallengeError` message in Docker and CI:
  # Depending on the value of the NODE_ENV environment variable,
  # the `WWWAuthenticateChallengeError` may be replaced in an `Unauthorized` error.
  # Because we force NODE_ENV=development locally and in CI when starting the app,
  # the test works in both cases. However, in K8S CI, INTEGRATION (and PRODUCTION),
  # where we start the app with pm2-runtime without setting this variable, it does not work,
  # because the error is replaced and only an `Unauthorized` message is returned.

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
