#language: fr
Fonctionnalité: Connexion à un FI

  @ignoreInteg01
  Scénario: Je me rends sur la page du FI et je récupère correctement le sp_id
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Alors la page du FI affiche l'id du FS "premier FS"

  @ignoreInteg01
  Scénario: Je me rends sur la page du FI et je récupère correctement le sp_name
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Alors la page du FI affiche le nom du FS "premier FS"

  @ignoreInteg01
  Scénario: J'utilise un fournisseur d'identité désactivé
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia3.fr"
    Quand je clique sur le bouton de connexion
    Alors je suis redirigé vers la page erreur technique
    Et le titre de la page d'erreur est "Accès indisponible"
    Et le code d'erreur est "Y500017"
    Et je clique sur le bouton Retour au service
    Et je suis redirigé vers la page erreur du fournisseur de service

  # use this test only when using core-fca-rie
  @ignore
  Scénario: J'utilise un fqdn ne redirigeant vers aucun FI et il n'y a pas de FI par défaut
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@unknown.fr"
    Quand je clique sur le bouton de connexion
    Alors je suis redirigé vers la page erreur technique
    Et le titre de la page d'erreur est "Accès impossible"
    Et le code d'erreur est "Y500001"

  @ignoreInteg01
  Scénario: Affichage d'une erreur technique lorsque le FI n'est pas joignable
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fi-rie.fr"
    Et que je clique sur le bouton de connexion
    Alors je suis redirigé vers la page erreur technique
    Et le titre de la page d'erreur est "Accès impossible"
    Et le message d'erreur est "Failed to establish tunnel"
    Et le code d'erreur est "Y020031"

  @ignoreInteg01
  Scénario: Retour en arrière après une connexion réussie
    Étant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis connecté au fournisseur de service
    Quand je reviens en arrière
    Quand je reviens en arrière
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "oidc-provider-error:session-not-found"
