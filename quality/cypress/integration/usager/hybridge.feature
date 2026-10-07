#language: fr
Fonctionnalité: Hybridge

  @ignoreDocker
  Scénario: Test de l'hybridge en intégration
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia3-rie.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page permettant la selection d'un fournisseur d'identité
    Et je teste l'hybridge avec le fournisseur d'identité "Identity Provider 3 - RS256 RIE"

  @ignoreInteg01 @hybridge
  Scénario: Connexion d'un usager via l'hybridge RIE
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fi-rie.fr"
    Quand je clique sur le bouton de connexion
    Et que la page d'avertissement d'utilisation du hybridge s'affiche pour le fournisseur d'identité "fia-rie-low"
    Et que je clique sur le bouton Continuer quand même
    Et je suis redirigé vers la page login du fournisseur d'identité "Identity Provider RIE - eIDAS faible - ES256"
    Et je m'authentifie
    Alors je suis connecté au fournisseur de service

  @ignoreInteg01 @hybridge
  Scénario: Initiation d'une authentification cross-device via l'hybridge RIE
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fi-rie.fr"
    Quand je clique sur le bouton de connexion
    Et que la page d'avertissement d'utilisation du hybridge s'affiche pour le fournisseur d'identité "fia-rie-low"
    Et que je clique sur le bouton Continuer en Cross-Device
    Alors je suis redirigé vers la page d'authentification cross-device
    Et une demande d'authentification cross-device a été créée pour l'email "test@fi-rie.fr"
