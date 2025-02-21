#language: fr
@usager @deconnexionUsager @fcpLow @fcpHigh
Fonctionnalité: Deconnexion Usager
  # En tant qu'usager d'un fournisseur de service,
  # je veux me déconnecter du fournisseur de service, de FranceConnect et du fournisseur d'identité
  # afin de clore ma session

  @ignoreDocker
  Scénario: Déconnexion d'un usager (FI avec endSessionUrl)
    Etant donné que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que j'utilise un fournisseur d'identité "actif"
    Et que je clique sur le fournisseur d'identité
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Et que je m'authentifie avec succès
    Et que je suis redirigé vers la page confirmation de connexion
    Et que je continue sur le fournisseur de service
    Et que je suis connecté au fournisseur de service
    Quand je me déconnecte du fournisseur de service et du fournisseur d'identité
    Alors je suis déconnecté du fournisseur d'identité
    Et la session FranceConnect est détruite
    Et je suis déconnecté du fournisseur de service
    Et je suis redirigé vers la page fournisseur de service
    # @todo #1438 les doublons de set-cookie header est mal géré par Cypress 14
    # Cypress détecte toujours la présence du cookie
    # see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1438
    #Et le cookie "fc_session_id" est supprimé

  @ignoreInteg01 @ci
  Scénario: Déconnexion d'un usager (FI avec endSessionUrl) avec log métier
    Etant donné que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que j'utilise un fournisseur d'identité "actif"
    Et que je clique sur le fournisseur d'identité
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Et que je m'authentifie avec succès
    Et que je suis redirigé vers la page confirmation de connexion
    Et que je continue sur le fournisseur de service
    Et que je suis connecté au fournisseur de service
    Quand je me déconnecte du fournisseur de service et du fournisseur d'identité
    Alors je suis déconnecté du fournisseur d'identité
    Et la session FranceConnect est détruite
    Et je suis déconnecté du fournisseur de service
    Et je suis redirigé vers la page fournisseur de service
    # @todo #1438 les doublons de set-cookie header est mal géré par Cypress 14
    # Cypress détecte toujours la présence du cookie
    # see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1438
    #Et le cookie "fc_session_id" est supprimé
    Et l'événement "SP_REQUESTED_LOGOUT" est journalisé
    Et l'événement "FC_REQUESTED_LOGOUT_FROM_IDP" est journalisé
    Et l'événement "FC_SESSION_TERMINATED" est journalisé

  # Aucun FI sans end session url en integ01
  @ignoreDocker @ignoreInteg01
  Scénario: Déconnexion d'un usager (FI sans endSessionUrl)
    Etant donné que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que j'utilise un fournisseur d'identité "sans endSessionUrl"
    Et que je clique sur le fournisseur d'identité
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Et que je m'authentifie avec succès
    Et que je suis redirigé vers la page confirmation de connexion
    Et que je continue sur le fournisseur de service
    Et que je suis connecté au fournisseur de service
    Quand je me déconnecte du fournisseur de service et de FranceConnect
    Alors je suis déconnecté de FranceConnect
    Et la session FranceConnect est détruite
    Et je suis déconnecté du fournisseur de service
    Et je suis redirigé vers la page fournisseur de service
    # @todo #1438 les doublons de set-cookie header est mal géré par Cypress 14
    # Cypress détecte toujours la présence du cookie
    # see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1438
    #Et le cookie "fc_session_id" est supprimé

  @ignoreInteg01 @ci
  Scénario: Déconnexion d'un usager (FI sans endSessionUrl) avec log métier
    Etant donné que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que j'utilise un fournisseur d'identité "sans endSessionUrl"
    Et que je clique sur le fournisseur d'identité
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Et que je m'authentifie avec succès
    Et que je suis redirigé vers la page confirmation de connexion
    Et que je continue sur le fournisseur de service
    Et que je suis connecté au fournisseur de service
    Quand je me déconnecte du fournisseur de service et de FranceConnect
    Alors je suis déconnecté de FranceConnect
    Et la session FranceConnect est détruite
    Et je suis déconnecté du fournisseur de service
    Et je suis redirigé vers la page fournisseur de service
    # @todo #1438 les doublons de set-cookie header est mal géré par Cypress 14
    # Cypress détecte toujours la présence du cookie
    # see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1438
    #Et le cookie "fc_session_id" est supprimé
    Et l'événement "SP_REQUESTED_LOGOUT" est journalisé
    Et l'événement "FC_REQUESTED_LOGOUT_FROM_IDP" n'est pas journalisé
    Et l'événement "FC_SESSION_TERMINATED" est journalisé

  # Aucun FS sans post_logout_redirect_uri sur la stack fcp-low
  @ignoreInteg01 @ignoreLow
  Scénario: Déconnexion depuis un FS sans post logout redirect uri
    Etant donné que j'utilise un fournisseur de service "sans post_logout_redirect_uri"
    Et que le fournisseur de service requiert l'accès aux informations du scope "anonyme"
    Et que je navigue sur la page fournisseur de service
    Et que je me connecte à FranceConnect
    Et que je suis connecté au fournisseur de service
    Quand je me déconnecte du fournisseur de service et de FranceConnect
    Alors je suis déconnecté de FranceConnect
    Et la session FranceConnect est détruite
    Et je suis redirigé vers la page confirmation de déconnexion
    # @todo #1438 les doublons de set-cookie header est mal géré par Cypress 14
    # Cypress détecte toujours la présence du cookie
    # see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1438
    #Et le cookie "fc_session_id" est supprimé
    Et l'événement "SP_REQUESTED_LOGOUT" est journalisé
    Et l'événement "FC_REQUESTED_LOGOUT_FROM_IDP" est journalisé
    Et l'événement "FC_SESSION_TERMINATED" est journalisé
