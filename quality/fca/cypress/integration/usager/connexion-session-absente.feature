#language: fr
Fonctionnalité: Connexion Usager - session absente
  Scénario: Connexion OK - session inconnue lors de l'appel authorize
    Etant donné que je force un sessionId inexistant dans le cookie de session AgentConnect
    Et que je navigue sur la page fournisseur de service
    Quand je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page interaction

  Scénario: Connexion OK - retour sur la mire après sélection du fournisseur d'identité
    Etant donné que je navigue sur la page fournisseur de service "par défaut"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Quand je reviens en arrière
    Et je suis redirigé vers la page interaction
    Et j'entre l'email "test@fia1.fr"
    Et je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Alors je m'authentifie
    Et je suis redirigé vers la page fournisseur de service "par défaut"

  Scénario: Erreur lors de la connexion - session absente sur page interaction
    Etant donné que je navigue sur la page fournisseur de service "par défaut"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Quand je supprime les cookies AgentConnect
    Et je rafraîchis la page
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "oidc-provider-error:session-not-found"

  Scénario: Erreur lors de la connexion - session absente au retour du FI
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Et que je supprime les cookies AgentConnect
    Quand je m'authentifie
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "oidc-provider-error:session-not-found"

  Scénario: Erreur lors de la connexion - session absente sur la page multi FI
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@polyfi.fr"
    Et que je clique sur le bouton de connexion
    Quand je supprime les cookies AgentConnect
    Et je rafraîchis la page
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "oidc-provider-error:session-not-found"
