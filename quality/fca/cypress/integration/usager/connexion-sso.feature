#language: fr
Fonctionnalité: Connexion Usager - SSO

  Plan du Scénario: Connexion SSO - deux FS avec accès au même FI
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je rentre "<prompt premier FS>" dans le champ prompt
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "second fs"
    Et que je rentre "<prompt deuxième FS>" dans le champ prompt
    Quand je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page fournisseur de service "second fs"
    Et je suis connecté au fournisseur de service

    Exemples:
      | prompt premier FS | prompt deuxième FS |
      | login             | disabled           |
      | login consent     | login              |
      | disabled          | login consent      |

  @ignoreInteg01
  Scénario: Connexion SSO - deuxième FS utilise un autre FI
    Etant donné que je navigue sur la page fournisseur de service "troisième fs"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia8.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "troisième fs"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "par défaut"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand je m'authentifie
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service

  @ignoreInteg01
  Scénario: Connexion SSO - troisième FS utilise SSO après une cinématique non terminée
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "troisième fs"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que je navigue sur la page fournisseur de service "second fs"
    Quand je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page fournisseur de service "second fs"
    Et je suis connecté au fournisseur de service

  # Il faut modifier le FS mock pour pouvoir avoir un état connecté/déconnecté
  @ignoreInteg01
  Scénario: Connexion SSO - déconnexion d'un FS seulement et SSO terminé
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "second fs"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page fournisseur de service "second fs"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Quand je me déconnecte du fournisseur de service
    Alors je suis déconnecté du fournisseur de service
    Et je clique sur le bouton ProConnect
    Et je suis redirigé vers la page interaction
    Et je navigue sur la page fournisseur de service "second fs"
    Et je suis connecté au fournisseur de service

  # Il faut modifier le FS mock pour pouvoir avoir un état connecté/déconnecté
  # bloqué par https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1213
  @ignoreInteg01
  Scénario: Connexion SSO - déconnexion de plusieurs FS
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "troisième fs"
    Et que le fournisseur de service requiert l'accès aux informations du scope "obligatoires"
    Et que le fournisseur de service ne requiert pas le claim "amr"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page fournisseur de service "troisième fs"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Et que je me déconnecte du fournisseur de service
    Et que je suis déconnecté du fournisseur de service
    Et que je navigue sur la page fournisseur de service "troisième fs"
    Et que je suis connecté au fournisseur de service
    Quand je me déconnecte du fournisseur de service
    Alors je suis déconnecté du fournisseur de service
    Alors le fournisseur de service requiert l'accès aux informations du scope "obligatoires"
    Et le fournisseur de service ne requiert pas le claim "amr"
    Et je clique sur le bouton ProConnect
    Et je suis redirigé vers la page interaction

