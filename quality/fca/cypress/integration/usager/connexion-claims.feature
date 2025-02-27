#language: fr
Fonctionnalité: Connexion avec Claims
  Scénario: Connexion avec claims - avec claim AMR pwd
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert le claim "amr"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand je m'authentifie
    Alors la cinématique a renvoyé l'amr "pwd"

  Scénario: Connexion avec claims - claim AMR absent si non demandé
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service ne requiert pas le claim "amr"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand je m'authentifie
    Alors la cinématique n'a pas renvoyé d'amr

  Scénario: Connexion avec claims - erreur FS non habilité pour amr
    Etant donné que je navigue sur la page fournisseur de service "non habilité à demander le claim amr"
    Et que le fournisseur de service requiert l'accès aux informations des scopes "obligatoires"
    Et que le fournisseur de service requiert le claim "amr"
    Et que je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y030009"
