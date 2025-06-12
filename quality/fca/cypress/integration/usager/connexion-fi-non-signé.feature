#language: fr
Fonctionnalité: Connexion Usager avec FI (user info non signé)
  Scénario: Connexion OK 
    Etant donné que je navigue sur la page fournisseur de service "par défaut"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia2.fr"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Quand je reviens en arrière
    Et je suis redirigé vers la page interaction
    Et j'entre l'email "test@fia2.fr"
    Et je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Alors je m'authentifie
    Et je suis redirigé vers la page fournisseur de service "par défaut"
