#language: fr
Fonctionnalité: Connexion Usager - PKCE

  Scénario: Authentification nominale avec PKCE
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect PKCE
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je m'authentifie
    Alors je suis connecté au fournisseur de service

  Scénario: Authentification avec PKCE sans code_challenge_method
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service ne fournit pas le paramètre code_challenge_method
    Et que je clique sur le bouton ProConnect PKCE
    Alors je suis redirigé vers la page erreur du fournisseur de service
    Et le titre de l'erreur fournisseur de service est "invalid_request"
    Et la description de l'erreur fournisseur de service est "plain%20code_challenge_method%20fallback%20disabled%2C%20code_challenge_method%20must%20be%20provided"

  Scénario: Authentification avec PKCE avec code_challenge_method plain
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service utilise le paramètre code_challenge_method "plain"
    Et que je clique sur le bouton ProConnect PKCE
    Alors je suis redirigé vers la page erreur du fournisseur de service
    Et le titre de l'erreur fournisseur de service est "invalid_request"
    Et la description de l'erreur fournisseur de service est "not%20supported%20value%20of%20code_challenge_method"