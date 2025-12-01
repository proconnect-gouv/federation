#language: fr
@ignoreInteg01
Fonctionnalité: Connexion Usager - Email autorisé
  Scénario: Connexion à un FS qui limite les emails avec un email authorisé
    Etant donné que je navigue sur la page fournisseur de service "avec une restriction de fqdn"
    Et que le fournisseur de service requiert l'accès aux informations du scope "obligatoires"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "fqdnautorise@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand je m'authentifie
    Alors je suis redirigé vers la page fournisseur de service "avec une restriction de fqdn"
    Et je suis connecté au fournisseur de service

  Scénario: Connexion à un FS qui limite les email avec un email non authorisé
    Etant donné que je navigue sur la page fournisseur de service "avec une restriction de fqdn"
    Et que le fournisseur de service requiert l'accès aux informations du scope "obligatoires"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@nonautorise.fr"
    Quand je clique sur le bouton de connexion
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500025"

  Scénario: Connexion à un FS qui limite les email avec un email non authorisé après une connexion réussie
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@nonautorise.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je navigue sur la page fournisseur de service "avec une restriction de fqdn"
    Et que le fournisseur de service requiert l'accès aux informations du scope "obligatoires"
    Et que je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500025"
