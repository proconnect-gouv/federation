#language: fr
Fonctionnalité: Connexion Usager - idp_hint

  @ignoreInteg01
  Scénario: Connexion avec idp_hint valide
    Etant donné que je navigue sur la page fournisseur de service
    Quand je rentre l'id du fournisseur d'identité "par défaut" dans le champ idp_hint
    Et que je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Et je m'authentifie
    Et je suis connecté au fournisseur de service

  @ignoreInteg01
  Scénario: Connexion avec idp_hint valide et session ouverte avec le même FI
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Alors je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Et je m'authentifie
    Et je suis redirigé vers la page fournisseur de service "premier FS"
    Et je suis connecté au fournisseur de service
    Quand je navigue sur la page fournisseur de service "second fs"
    Et que je rentre l'id du fournisseur d'identité "par défaut" dans le champ idp_hint
    Et que je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page fournisseur de service "second fs"

  @ignoreInteg01
  Scénario: Connexion avec idp_hint valide et session ouverte avec un FI différent
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Alors je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Et je m'authentifie
    Et je suis redirigé vers la page fournisseur de service "premier FS"
    Et je suis connecté au fournisseur de service
    Quand je navigue sur la page fournisseur de service "second fs"
    Et que je rentre l'id du fournisseur d'identité "différent" dans le champ idp_hint
    Et que je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page login du fournisseur d'identité "différent"

  Scénario: Connexion avec idp_hint invalide
    Etant donné que je navigue sur la page fournisseur de service
    Et que je rentre un id qui ne correspond à aucun fournisseur d'identité dans le champ idp_hint
    Quand je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page erreur du fournisseur de service
    Et le titre de l'erreur fournisseur de service est "idp_hint_not_found"
    Et la description de l'erreur fournisseur de service est "The+provided+idp_hint+could+not+be+found"
