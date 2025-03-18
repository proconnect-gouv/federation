#language: fr
Fonctionnalité: Connexion Usager personnalisé
  @ignoreInteg01
  Scénario: Connexion d'un usager - claim phone_number non renvoyé si mauvais format
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert l'accès aux informations des scopes "tous les scopes"
    Et que le fournisseur de service demande un niveau de sécurité "eidas1" via acr_values
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand j'utilise un compte usager avec téléphone incorrect
    Et que je m'authentifie
    Alors le fournisseur de service a accès aux informations du scope "tous les scopes sauf phone" en provenance du FI "par défaut"

  Scénario: Connexion d'un usager - mauvais format d'email et vérification de l'erreur
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand j'utilise un compte usager avec email incorrect
    Et que je m'authentifie
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500006"
    Et le lien vers le support est affiché
    Et le lien correspond à l'erreur Y500006 avec l'email "incorrect"

  Scénario: Connexion d'un usager - pas d'email
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand j'utilise un compte usager sans email
    Et je m'authentifie
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500006"

  @ignoreInteg01
  Scénario: Connexion d'un usager avec un FI sans supportEmail - mauvais format d'email et vérification de l'erreur
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia2.fr"
    Et que je clique sur le bouton de connexion
    Quand j'utilise un compte usager avec email incorrect
    Et que je m'authentifie
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500006"
    Et le lien vers le support est affiché
    Et le lien correspond à l'erreur Y500006 avec l'email "incorrect"

  @ignoreInteg01
  Scénario: Connexion d'un usager - mauvais format de siret avec siret par défaut
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand j'utilise un compte usager avec siret incorrect
    Et que je m'authentifie
    Alors le siret transmis au fournisseur de service est le suivant "81801912700021"

  @ignoreInteg01
  Scénario: Connexion d'un usager - mauvais format de siret sans siret par défaut
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia2.fr"
    Et que je clique sur le bouton de connexion
    Quand j'utilise un compte usager avec siret incorrect
    Et que je m'authentifie
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500026"

