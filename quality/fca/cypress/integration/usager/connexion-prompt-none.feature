#language: fr
Fonctionnalité: Connexion avec prompt none

  Scénario: Connexion avec prompt none - SSO ok
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "second fs"
    Et que je rentre "none" dans le champ prompt
    Quand je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page fournisseur de service "second fs"
    Et je suis connecté au fournisseur de service


