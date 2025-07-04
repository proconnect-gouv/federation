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
  Scénario: J'utilise un fournisseur d'identité désactivé
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia3.fr"
    Quand je clique sur le bouton de connexion
    Alors je suis redirigé vers la page erreur technique
    Et le titre de la page d'erreur est "Accès indisponible"
    Et le code d'erreur est "Y500017"

  # use this test only when using core-fca-rie
  @ignore
  Scénario: J'utilise un fqdn ne redirigeant vers aucun FI et il n'y a pas de FI par défaut
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@unknown.fr"
    Quand je clique sur le bouton de connexion
    Alors je suis redirigé vers la page erreur technique
    Et le titre de la page d'erreur est "Accès indisponible"
    Et le code d'erreur est "Y500001"

  Scénario: J'utilise un FS sans signature du user info
    Etant donné que je navigue sur la page fournisseur de service "sans signature de la réponse userinfo"
    Et que je clique sur le bouton ProConnect
    Et j'entre l'email "test@fia1.fr"
    Et je clique sur le bouton de connexion
    Alors je m'authentifie
    Et je suis redirigé vers la page fournisseur de service "sans signature de la réponse userinfo"
