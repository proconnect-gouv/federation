#language: fr
@ignoreInteg01
Fonctionnalité: Connexion Usager - session fca-low (avec SSO)

  Scénario: Session avec SSO activé - Nouvelle session créée lors de l'appel à authorize (1ère connexion)
    Etant donné que je navigue sur la page fournisseur de service
    Quand je clique sur le bouton ProConnect
    Et le cookie "pc_session_id" est présent
    Et l'événement "FC_AUTHORIZE_INITIATED" est journalisé avec "browsingSessionId" "non null" et "sessionId" "non null"

  Scénario: Session avec SSO activé - Nouvelle session initialisée lors de l'appel à authorize (2ème connexion)
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que le cookie "pc_session_id" est présent
    Et que je mémorise la valeur du cookie "pc_session_id"
    # Evènement SP_REQUESTED_FC_USERINFO: première cinématique finalisée
    Et que l'événement "SP_REQUESTED_FC_USERINFO" est journalisé
    Et que je mémorise la valeur "browsingSessionId" de l'événement "SP_REQUESTED_FC_USERINFO"
    Et que je mémorise la valeur "sessionId" de l'événement "SP_REQUESTED_FC_USERINFO"
    Quand je navigue sur la page fournisseur de service "second FS"
    Et je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page fournisseur de service "second FS"
    Et je suis connecté au fournisseur de service
    # le cookie n'est pas supprimé en fin de cinématique
    Et le cookie "pc_session_id" est présent
    Et la valeur du cookie "pc_session_id" est identique
    # Evènement FC_AUTHORIZE_INITIATED: cinématique SSO initialisée avec nouveau sessionId
    Et l'événement "FC_AUTHORIZE_INITIATED" est journalisé
    Et la valeur "browsingSessionId" est identique dans l'événement "FC_AUTHORIZE_INITIATED"
    Et la valeur "sessionId" est identique dans l'événement "FC_AUTHORIZE_INITIATED"
    Et je mémorise la valeur "sessionId" de l'événement "FC_AUTHORIZE_INITIATED"
    # Evènement FC_DATATRANSFER_INFORMATION_IDENTITY: sessionId non changé
    Et l'événement "FC_AUTHORIZE_INITIATED" est journalisé
    Et la valeur "browsingSessionId" est identique dans l'événement "FC_AUTHORIZE_INITIATED"
    Et la valeur "sessionId" est identique dans l'événement "FC_AUTHORIZE_INITIATED"
    # Evènement SP_REQUESTED_FC_USERINFO: les données de session sont accessibles depuis le back channel
    Et l'événement "SP_REQUESTED_FC_USERINFO" est journalisé
    Et la valeur "browsingSessionId" est identique dans l'événement "SP_REQUESTED_FC_USERINFO"
    Et la valeur "sessionId" est identique dans l'événement "SP_REQUESTED_FC_USERINFO"

  Scénario: Session avec SSO activé - Session non détachée avant le retour au FS
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et je suis connecté au fournisseur de service
    Et le cookie "pc_session_id" est présent
