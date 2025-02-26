#language: fr
@usager @ignoreDocker
Fonctionnalité: Connexion Partenaires
  Scénario: Connexion d'un usager - ProConnect Identité : agent public
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "user@yopmail.com"
    Quand je clique sur le bouton de connexion
    Et que je me connecte sur ProConnect Identité avec le mot de passe "user@yopmail.com"
    Et que je sélectionne une organisation publique
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service

  Scénario: Connexion d'un usager - ProConnect Identité : employé du privé
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "user@yopmail.com"
    Quand je clique sur le bouton de connexion
    Et que je me connecte sur ProConnect Identité avec le mot de passe "user@yopmail.com"
    Et que je sélectionne une organisation privée
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500015"
