#language: fr
Fonctionnalité: Connexion avec manipulation du paramêtre prompt
  Scénario: Prompt=none pour un utilisateur déjà connecté
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "second FS"
    Et que je rentre "none" dans le champ prompt
    Quand je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page fournisseur de service "second FS"
    Et je suis connecté au fournisseur de service

  Scénario: Prompt=none pour un utilisateur non connecté
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je rentre "none" dans le champ prompt
    Et que je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page erreur du fournisseur de service
    Et le titre de l'erreur fournisseur de service est "login_required"
    Et la description de l'erreur fournisseur de service est "End-User%20authentication%20is%20required"

  Scénario: Prompt non supporté
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je rentre "select_account" dans le champ prompt
    Et que je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page erreur du fournisseur de service
    Et le titre de l'erreur fournisseur de service est "invalid_request"
    Et la description de l'erreur fournisseur de service est "unsupported%20prompt%20value%20requested"
