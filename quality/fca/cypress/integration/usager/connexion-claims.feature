#language: fr
Fonctionnalité: Connexion avec Claims
  Scénario: demande claim amr essential
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert le claim "amr"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand je m'authentifie
    Alors la cinématique a renvoyé l'amr "pwd"

  Scénario: pas de demande du claim amr
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service ne requiert pas le claim "amr"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand je m'authentifie
    Alors la cinématique n'a pas renvoyé d'amr

  Scénario: demande du claim given_name essential
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert le claim "given_name"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand je m'authentifie
    Alors la cinématique a renvoyé le claim "given_name"

  @ignoreInteg01
  Scénario: erreur FS non habilité pour amr
    Etant donné que je navigue sur la page fournisseur de service "non habilité à demander le claim amr"
    Et que le fournisseur de service requiert l'accès aux informations des scopes "obligatoires"
    Et que le fournisseur de service requiert le claim "amr"
    Et que je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y030009"
