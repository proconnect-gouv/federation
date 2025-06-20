#language: fr
Fonctionnalité: Connexion Usager avec FI (user info non signé)
  Scénario: Connexion OK 
    Etant donné que je navigue sur la page fournisseur de service "par défaut"
    Et que je clique sur le bouton ProConnect
    Et j'entre l'email "test@fia2.fr"
    Et je clique sur le bouton de connexion
    Alors je m'authentifie
    Et je suis redirigé vers la page fournisseur de service "par défaut"
