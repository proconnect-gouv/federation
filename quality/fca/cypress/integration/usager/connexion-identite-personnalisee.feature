#language: fr
@usager @connexionUsager @ci @ignoreInteg01
Fonctionnalité: Connexion Usager personnalisé
  # En tant qu'usager d'un fournisseur de service,
  # je veux me connecter avec un compte personnalisé

  Scénario: Connexion d'un usager - identité personnalisée
    Etant donné que je navigue sur la page fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations des scopes "tous les scopes"
    Et que le fournisseur de service requiert un acr_values à "eidas1"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Et que j'utilise un compte usager "personnalisé"
    Quand je saisis manuellement l'identité de l'utilisateur
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service
    Et le fournisseur de service a accès aux informations du scope "tous les scopes"

  Scénario: Connexion d'un usager - claim phone_number non renvoyé si mauvais format
    Etant donné que j'utilise un compte usager "personnalisé avec téléphone incorrect"
    Et que je navigue sur la page fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations des scopes "tous les scopes"
    Et que le fournisseur de service requiert un acr_values à "eidas1"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Quand je saisis manuellement l'identité de l'utilisateur
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service
    Et le fournisseur de service a accès aux informations du scope "tous les scopes sauf phone"

  Scénario: Connexion d'un usager - mauvais format d'email
    Etant donné que j'utilise un compte usager "personnalisé avec email incorrect"
    Et que je navigue sur la page fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations des scopes "tous les scopes"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Quand je saisis manuellement l'identité de l'utilisateur
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500006"

  Scénario: Connexion d'un usager - mauvais format de siret avec siret par défaut
    Etant donné que j'utilise un compte usager "personnalisé avec siret incorrect"
    Et que je navigue sur la page fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations des scopes "tous les scopes"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Et que je saisis manuellement l'identité de l'utilisateur
    Quand je suis redirigé vers la page fournisseur de service "par défaut"
    Alors le siret transmis au fournisseur de service est le suivant "81801912700021"

  Scénario: Connexion d'un usager - mauvais format de siret sans siret par défaut
    Etant donné que j'utilise un compte usager "personnalisé avec siret incorrect"
    Et que j'utilise le fournisseur d'identité "sans siret par défaut"
    Et que je navigue sur la page fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations des scopes "tous les scopes"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia2.fr"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Quand je saisis manuellement l'identité de l'utilisateur
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500026"

