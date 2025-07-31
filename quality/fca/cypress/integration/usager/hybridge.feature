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
    Et je suis redirigé vers la page login du fournisseur d'identité "Identity Provider RIE - eIDAS faible - ES256"
    Et je m'authentifie
    Alors je suis connecté au fournisseur de service
