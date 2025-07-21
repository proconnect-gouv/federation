#language: fr
Fonctionnalité: Connexion Usager - SSO

  Plan du Scénario: Deux FS avec accès au même FI
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
  Scénario: Déconnexion d'un FS seulement et SSO terminé
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
    Quand je clique sur le bouton de déconnexion
    Alors je suis déconnecté du fournisseur de service
    Et je clique sur le bouton ProConnect
    Et je suis redirigé vers la page interaction
    Et je navigue sur la page fournisseur de service "second fs"
    Et je suis connecté au fournisseur de service

  # Il faut modifier le FS mock pour pouvoir avoir un état connecté/déconnecté
  # bloqué par https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1213
  @ignoreInteg01
  Scénario: Déconnexion de plusieurs FS
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "troisième fs"
    Et que le fournisseur de service requiert l'accès aux informations du scope "obligatoires"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page fournisseur de service "troisième fs"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Et que je clique sur le bouton de déconnexion
    Et que je suis déconnecté du fournisseur de service
    Et que je navigue sur la page fournisseur de service "troisième fs"
    Et que je suis connecté au fournisseur de service
    Quand je clique sur le bouton de déconnexion
    Alors je suis déconnecté du fournisseur de service
    Alors le fournisseur de service requiert l'accès aux informations du scope "obligatoires"
    Et le fournisseur de service ne requiert pas le claim "amr"
    Et je clique sur le bouton ProConnect
    Et je suis redirigé vers la page interaction

  @ignoreInteg01
  Scénario: La session n'est pas ré-utilisée lorsque le niveau ACR n'est pas satisfait
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que le fournisseur de service demande le claim "acr"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que la cinématique a utilisé le niveau de sécurité "eidas1"
    Quand je navigue sur la page fournisseur de service "second fs"
    Et que le fournisseur de service requiert un niveau de sécurité "eidas2"
    Et que je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page interaction

