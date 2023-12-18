#language: fr
@usager @fiRetour
Fonctionnalité: Fournisseur Identité - Retour
  # En tant qu'usager,
  # je veux retourner depuis le FI
  # afin de choisir un autre FI ou continuer ma cinématique

  # @todo #1482 route OidcCallback legacy à supprimer
  # @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1482
  # Uniquement un FI configuré sur la stack locale fcp-high
  @fcpHigh @ignoreInteg01
  Scénario: Fournisseur Identité - Retour en utilisant une route OidcCallback legacy
    Etant donné que j'utilise un fournisseur d'identité "utilisant une route OidcCallback legacy"
    Et que je navigue sur la page fournisseur de service
    Quand je me connecte à FranceConnect
    Alors je suis connecté au fournisseur de service
