#language: fr
Fonctionnalité: Connexion Usager avec FS (user info non signé)
  Scénario: Connexion OK 
    Etant donné que je navigue sur la page fournisseur de service "sans signature de la réponse userinfo"
    Et que je clique sur le bouton ProConnect
    Et j'entre l'email "test@fia1.fr"
    Et je clique sur le bouton de connexion
    Alors je m'authentifie
    Et je suis redirigé vers la page fournisseur de service "sans signature de la réponse userinfo"
