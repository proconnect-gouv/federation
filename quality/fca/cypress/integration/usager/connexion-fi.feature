#language: fr
@usager @connexionClaims @ci
Fonctionnalité: Connexion à un FI
  # En tant qu'usager d'un fournisseur de service,
  # je veux accéder à la mire du fournisseur d'identité
  # afin de m'authentifier

  @ignoreInteg01
  Scénario: Je me rends sur la page du FI et je récupère correctement le sp_id
    Etant donné que je navigue sur la page fournisseur de service "avec accès au FI par défaut (premier FS)"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Alors la page du FI affiche l'id du FS "avec accès au FI par défaut (premier FS)"

  Scénario: Je me connecte à un FI avec un usagé sans email
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand j'utilise un compte usager sans email
    Et je m'authentifie
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500006"

  @ignoreInteg01
  Scénario: J'utilise un fournisseur d'identité blacklisté
    Etant donné que je navigue sur la page fournisseur de service "avec accès au FI par défaut (premier FS)"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia3.fr"
    Quand je clique sur le bouton de connexion
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500023"

  @ignoreInteg01
  Scénario: J'utilise un fournisseur d'identité désactivé mais non blacklisté
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia7.fr"
    Quand je clique sur le bouton de connexion
    Alors je suis redirigé vers la page erreur technique
    Et le titre de la page d'erreur est "Accès indisponible"
    Et le code d'erreur est "Y500017"

  # use this test only when using core-fca-rie
  @ignore
  Scénario: J'utilise un fqdn ne redirigeant vers aucun FI et il n'y a pas de FI par défaut
    Etant donné que je navigue sur la page fournisseur de service "avec accès au FI par défaut (premier FS)"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@unknown.fr"
    Quand je clique sur le bouton de connexion
    Alors je suis redirigé vers la page erreur technique
    Et le titre de la page d'erreur est "Accès indisponible"
    Et le code d'erreur est "Y500001"
