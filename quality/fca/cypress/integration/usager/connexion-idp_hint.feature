#language: fr
Fonctionnalité: Connexion Usager - idp_hint

  @ignoreInteg01
  Scénario: Connexion initiale + SSO avec idp_hint valide
    Etant donné que je navigue sur la page fournisseur de service "avec accès au FI par défaut (premier FS)"
    Quand je rentre l'id du fournisseur d'identité "autorisé pour idp_hint" dans le champ idp_hint
    Et que je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page login du fournisseur d'identité "autorisé pour idp_hint"
    Et je m'authentifie
    Et je suis redirigé vers la page fournisseur de service "avec accès au FI par défaut (premier FS)"
    Et je suis connecté au fournisseur de service
    Quand je navigue sur la page fournisseur de service "avec accès au FI par défaut (deuxième FS)"
    Et que je rentre l'id du fournisseur d'identité "autorisé pour idp_hint" dans le champ idp_hint
    Et que je clique sur le bouton ProConnect
    Et je suis redirigé vers la page fournisseur de service "avec accès au FI par défaut (deuxième FS)"
    Et je suis connecté au fournisseur de service

  Scénario: Connexion avec idp_hint invalide
    Etant donné que je navigue sur la page fournisseur de service
    Et que je rentre l'id du fournisseur d'identité "non autorisé pour idp_hint" dans le champ idp_hint
    Quand je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page erreur du fournisseur de service
    Et le titre de l'erreur fournisseur de service est "invalid_idp_hint"
    Et la description de l'erreur fournisseur de service est "An+idp_hint+was+provided+but+is+not+allowed"
