#language: fr
Fonctionnalité: Connexion avec prompt none

  Scénario: Connexion avec prompt none - SSO ok
    Etant donné que je navigue sur la page fournisseur de service "avec accès au FI par défaut (premier FS)"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "avec accès au FI par défaut (premier FS)"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "avec accès au FI par défaut (deuxième FS)"
    Et que je rentre "none" dans le champ prompt
    Quand je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page fournisseur de service "avec accès au FI par défaut (deuxième FS)"
    Et je suis connecté au fournisseur de service

  @ignoreInteg01
  Scénario: Connexion avec prompt none - deuxième FS sans accès au FI
    Etant donné que je navigue sur la page fournisseur de service "avec accès exclusif à un FI"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia8.fr"
    Quand je clique sur le bouton de connexion
    Et je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "avec accès exclusif à un FI"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "par défaut"
    Et que je rentre "none" dans le champ prompt
    Quand je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et le titre de l'erreur fournisseur de service est "login_required"
    Et la description de l'erreur fournisseur de service est "End-User+authentication+is+required"

  Scénario: Connexion avec prompt none - SSO désactivé pour le deuxième FS
    Etant donné que je désactive le SSO pour le fournisseur de service "avec accès au FI par défaut (premier FS)"
    Et que je navigue sur la page fournisseur de service "avec accès au FI par défaut (deuxième FS)"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "avec accès au FI par défaut (deuxième FS)"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "avec accès au FI par défaut (premier FS)"
    Et que je rentre "none" dans le champ prompt
    Quand je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page fournisseur de service "avec accès au FI par défaut (premier FS)"
    Et le titre de l'erreur fournisseur de service est "login_required"
    Et la description de l'erreur fournisseur de service est "End-User+authentication+is+required"
    # Réactiver le SSO sur le FS en fin de scénario
    Et j'active le SSO pour le fournisseur de service "avec accès au FI par défaut (premier FS)"
