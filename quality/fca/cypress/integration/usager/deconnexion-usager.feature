#language: fr
Fonctionnalité: Déconnexion Usager

  @ignoreInteg01
  Scénario: Déconnexion d'un usager avec log métier
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "par défaut"
    Et que je suis connecté au fournisseur de service
    Quand je clique sur le bouton de déconnexion et j'enregistre la réponse de ProConnect et du FI "par défaut"
    Alors je suis déconnecté du fournisseur de service, de ProConnect et du FI
    Et je suis déconnecté du fournisseur de service
    Et je suis redirigé vers la page fournisseur de service "par défaut"
    Et le cookie "pc_session_id" est supprimé
    Et l'événement "SP_REQUESTED_LOGOUT" est journalisé
    Et l'événement "FC_REQUESTED_LOGOUT_FROM_IDP" est journalisé
    Et l'événement "FC_SESSION_TERMINATED" est journalisé

  @ignoreInteg01
  Scénario: Déconnexion d'un usager avec un FS sans redirection post logout redirect uri
    Etant donné que je navigue sur la page fournisseur de service "second FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "second FS"
    Et que je suis connecté au fournisseur de service
    Quand je clique sur le bouton de déconnexion et j'enregistre la réponse de ProConnect et du FI "par défaut"
    Alors je suis déconnecté du fournisseur de service, de ProConnect et du FI
    Et je suis déconnecté du fournisseur de service
    Et l'événement "SP_REQUESTED_LOGOUT" est journalisé
    Et l'événement "FC_REQUESTED_LOGOUT_FROM_IDP" est journalisé
    Et l'événement "FC_SESSION_TERMINATED" est journalisé
