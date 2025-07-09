#language: fr
Fonctionnalité: Hybridge

  @ignoreDocker
  Scénario: Test de l'hybridge en intégration
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "should-call-@fia3-rie.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page permettant la selection d'un fournisseur d'identité
    Et je teste l'hybridge avec le fournisseur d'identité "Identity Provider 3 - RS256 RIE"
