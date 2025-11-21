#language: fr
@ignoreInteg01
Fonctionnalité: Déconnexion Usager
  Scénario: Déconnexion d'un usager avec log métier
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis connecté au fournisseur de service
    Quand je clique sur le bouton de déconnexion
    Alors je suis déconnecté du fournisseur de service
    Et je suis redirigé vers la page fournisseur de service "par défaut"
    Et le cookie "pc_session_id" est supprimé
    Et l'événement "SP_REQUESTED_LOGOUT" est journalisé
    Et l'événement "FC_REQUESTED_LOGOUT_FROM_IDP" est journalisé
    Et l'événement "FC_SESSION_TERMINATED" est journalisé

  Scénario: Déconnexion d'un usager avec un FS sans redirection post logout redirect uri
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis connecté au fournisseur de service
    Quand je clique sur le bouton de déconnexion sans redirection
    Alors je suis redirigé vers la page de déconnexion
    Et l'événement "SP_REQUESTED_LOGOUT" est journalisé
    Et l'événement "FC_REQUESTED_LOGOUT_FROM_IDP" est journalisé
    Et l'événement "FC_SESSION_TERMINATED" est journalisé
