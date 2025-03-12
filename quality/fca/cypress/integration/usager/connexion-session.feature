#language: fr
@ignoreInteg01
Fonctionnalité: Connexion Usager - session fca-low (avec SSO)

  Scénario: Session avec SSO activé - Nouvelle session créée lors de l'appel à authorize (1ère connexion)
    Etant donné que je navigue sur la page fournisseur de service
    Quand je clique sur le bouton ProConnect
    Et le cookie "pc_session_id" est présent
    Et l'événement "FC_AUTHORIZE_INITIATED" est journalisé avec "browsingSessionId" "non null" et "sessionId" "non null" et "isSso" "false"

  Scénario: Session avec SSO activé - Nouvelle session initialisée lors de l'appel à authorize (2ème connexion)
    Etant donné que je navigue sur la page fournisseur de service "avec accès au FI par défaut (premier FS)"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que le cookie "pc_session_id" est présent
    Et que je mémorise la valeur du cookie "pc_session_id"
    # Evènement SP_REQUESTED_FC_USERINFO: première cinématique finalisée
    Et que l'événement "SP_REQUESTED_FC_USERINFO" est journalisé avec "accountId" "non null" et "isSso" "false"
    Et que je mémorise la valeur "browsingSessionId" de l'événement "SP_REQUESTED_FC_USERINFO"
    Et que je mémorise la valeur "sessionId" de l'événement "SP_REQUESTED_FC_USERINFO"
    Et que je mémorise la valeur "accountId" de l'événement "SP_REQUESTED_FC_USERINFO"
    Quand je navigue sur la page fournisseur de service "avec accès au FI par défaut (deuxième FS)"
    Et je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page fournisseur de service "avec accès au FI par défaut (deuxième FS)"
    Et je suis connecté au fournisseur de service
    # le cookie n'est pas supprimé en fin de cinématique
    Et le cookie "pc_session_id" est présent
    Et la valeur du cookie "pc_session_id" est différente
    # Evènement FC_AUTHORIZE_INITIATED: cinématique SSO initialisée avec nouveau sessionId
    Et l'événement "FC_AUTHORIZE_INITIATED" est journalisé avec "accountId" "non null" et "isSso" "true"
    Et la valeur "browsingSessionId" est identique dans l'événement "FC_AUTHORIZE_INITIATED"
    Et la valeur "sessionId" est différente dans l'événement "FC_AUTHORIZE_INITIATED"
    Et la valeur "accountId" est identique dans l'événement "FC_AUTHORIZE_INITIATED"
    Et je mémorise la valeur "sessionId" de l'événement "FC_AUTHORIZE_INITIATED"
    # Evènement FC_DATATRANSFER_INFORMATION_IDENTITY: sessionId non changé
    Et l'événement "FC_AUTHORIZE_INITIATED" est journalisé avec "accountId" "non null" et "isSso" "true"
    Et la valeur "browsingSessionId" est identique dans l'événement "FC_AUTHORIZE_INITIATED"
    Et la valeur "sessionId" est identique dans l'événement "FC_AUTHORIZE_INITIATED"
    Et la valeur "accountId" est identique dans l'événement "FC_AUTHORIZE_INITIATED"
    # Evènement SP_REQUESTED_FC_USERINFO: les données de session sont accessibles depuis le back channel
    Et l'événement "SP_REQUESTED_FC_USERINFO" est journalisé avec "accountId" "non null" et "isSso" "true"
    Et la valeur "browsingSessionId" est identique dans l'événement "SP_REQUESTED_FC_USERINFO"
    Et la valeur "sessionId" est identique dans l'événement "SP_REQUESTED_FC_USERINFO"
    Et la valeur "accountId" est identique dans l'événement "SP_REQUESTED_FC_USERINFO"

  Scénario: Session avec SSO activé - Nouvelle session après retour du FI si FI non disponible
    Etant donné je navigue sur la page fournisseur de service "avec accès exclusif à un FI"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia8.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "avec accès exclusif à un FI"
    Et que je suis connecté au fournisseur de service
    Et que le cookie "pc_session_id" est présent
    Et que je mémorise la valeur du cookie "pc_session_id"
    # Evènement SP_REQUESTED_FC_USERINFO: première cinématique finalisée
    Et que l'événement "SP_REQUESTED_FC_USERINFO" est journalisé avec "accountId" "non null" et "isSso" "false"
    Et que je mémorise la valeur "browsingSessionId" de l'événement "SP_REQUESTED_FC_USERINFO"
    Et que je mémorise la valeur "sessionId" de l'événement "SP_REQUESTED_FC_USERINFO"
    Et que je mémorise la valeur "accountId" de l'événement "SP_REQUESTED_FC_USERINFO"
    Et que je mémorise la valeur "idpId" de l'événement "SP_REQUESTED_FC_USERINFO"
    Et que je navigue sur la page fournisseur de service "par défaut"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que le cookie "pc_session_id" est présent
    Et que la valeur du cookie "pc_session_id" est différente
    Et que je mémorise la valeur du cookie "pc_session_id"
    # Evènement FC_AUTHORIZE_INITIATED: cinématique SSO initialisée dans un premier temps avec nouveau sessionId
    Et que l'événement "FC_AUTHORIZE_INITIATED" est journalisé avec "accountId" "non null" et "isSso" "true"
    Et que la valeur "browsingSessionId" est identique dans l'événement "FC_AUTHORIZE_INITIATED"
    Et que la valeur "sessionId" est différente dans l'événement "FC_AUTHORIZE_INITIATED"
    Et que la valeur "accountId" est identique dans l'événement "FC_AUTHORIZE_INITIATED"
    Et que je mémorise la valeur "sessionId" de l'événement "FC_AUTHORIZE_INITIATED"
    Quand j'entre l'email "test@fia1.fr"
    Et je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    # FC_IDP_BLACKLISTED: l'attribut isSso devient false
    Et l'événement "FC_IDP_BLACKLISTED" est journalisé avec "isSso" "false"
    # Evènement IDP_CHOSEN: les données de session concernant l'usager sont supprimées une fois le FI sélectionné
    Et l'événement "IDP_CHOSEN" est journalisé avec "accountId" "null" et "idpSub" "null" et "isSso" "false"
    Et la valeur "sessionId" est identique dans l'événement "IDP_CHOSEN"
    Et la valeur "idpId" est différente dans l'événement "IDP_CHOSEN"
    Et je mémorise la valeur "idpId" de l'événement "IDP_CHOSEN"
    # J'utilise un compte usager différent pour obtenir un accountId différent
    Et j'utilise le compte usager avec l'email "test2@fia1.fr"
    Et je m'authentifie
    Et je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service
    Et le cookie "pc_session_id" est présent
    Et la valeur du cookie "pc_session_id" est différente
    # Evènement IDP_CALLEDBACK: nouveau sessionId lors du retour depuis le FI
    Et l'événement "IDP_CALLEDBACK" est journalisé avec "idpId" "non null" et "accountId" "null" et "isSso" "false"
    Et la valeur "browsingSessionId" est identique dans l'événement "IDP_CALLEDBACK"
    Et la valeur "sessionId" est différente dans l'événement "IDP_CALLEDBACK"
    Et la valeur "idpId" est identique dans l'événement "IDP_CALLEDBACK"
    Et je mémorise la valeur "sessionId" de l'événement "IDP_CALLEDBACK"
    # Evènement FC_VERIFIED: accountId est recalculé
    Et l'événement "FC_VERIFIED" est journalisé avec "accountId" "non null" et "isSso" "false"
    Et la valeur "accountId" est différente dans l'événement "FC_VERIFIED"
    Et je mémorise la valeur "accountId" de l'événement "FC_VERIFIED"
    # Evènement SP_REQUESTED_FC_USERINFO: les données de session sont accessibles depuis le back channel
    Et l'événement "SP_REQUESTED_FC_USERINFO" est journalisé avec "accountId" "non null" et "isSso" "false"
    Et la valeur "browsingSessionId" est identique dans l'événement "SP_REQUESTED_FC_USERINFO"
    Et la valeur "sessionId" est identique dans l'événement "SP_REQUESTED_FC_USERINFO"
    Et la valeur "accountId" est identique dans l'événement "SP_REQUESTED_FC_USERINFO"

  Scénario: Session avec SSO activé - Session non détachée avant le retour au FS
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et je suis connecté au fournisseur de service
    Et le cookie "pc_session_id" est présent

