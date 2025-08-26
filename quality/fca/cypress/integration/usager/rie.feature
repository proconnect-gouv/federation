#language: fr
Fonctionnalité: Connexion au RIE

  @rie
  Scénario: J'utilise un fqdn ne redirigeant vers aucun FI et il n'y a pas de FI par défaut
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@unknown.fr"
    Quand je clique sur le bouton de connexion
    Alors je suis redirigé vers la page erreur technique
    Et le titre de la page d'erreur est "Accès impossible"
    Et le code d'erreur est "Y500001"
