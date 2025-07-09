#language: fr
@ignoreInteg01
Fonctionnalité: API - oidc-callback

  Scénario: API oidc-callback - state manquant
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je prépare une requête "oidc-callback"
    Et que je retire le paramètre "state" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 400
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et le corps de la réponse contient une page web
    Et je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y020021"

  Scénario: API oidc-callback - state vide
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je prépare une requête "oidc-callback"
    Et que je mets "" dans le paramètre "state" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 400
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et le corps de la réponse contient une page web
    Et je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y020021"

  Scénario: API oidc-callback - mauvais state
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je prépare une requête "oidc-callback"
    Quand je lance la requête
    Alors le statut de la réponse est 403
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et le corps de la réponse contient une page web
    Et je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y020022"

  Scénario: API oidc-callback - code manquant
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je paramètre un intercepteur pour l'appel authorize au fournisseur d'identité "par défaut"
    Et que je clique sur le bouton de connexion
    Et que je prépare une requête "oidc-callback"
    Et que je mets le state fourni par AC dans le paramètre "state" de la requête
    Et que je mets "https://fia1-low.docker.dev-franceconnect.fr" dans le paramètre "iss" de la requête
    Et que je retire le paramètre "code" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 400
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et le corps de la réponse contient une page web
    Et je suis redirigé vers la page erreur technique
    Et le code d'erreur est "RPError"
    Et le message d'erreur est "code missing from response"

  Scénario: API oidc-callback - code vide
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je paramètre un intercepteur pour l'appel authorize au fournisseur d'identité "par défaut"
    Et que je clique sur le bouton de connexion
    Et que je prépare une requête "oidc-callback"
    Et que je mets le state fourni par AC dans le paramètre "state" de la requête
    Et que je mets "https://fia1-low.docker.dev-franceconnect.fr" dans le paramètre "iss" de la requête
    Et que je mets "" dans le paramètre "code" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 400
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et le corps de la réponse contient une page web
    Et je suis redirigé vers la page erreur technique
    Et le code d'erreur est "RPError"
    Et le message d'erreur est "code missing from response"

  Scénario: API oidc-callback - affichage de l'erreur remontée via le paramètre error
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que le fournisseur d'identité renvoie l'erreur "invalid_scope" avec "your scopes are invalid"
    Et je m'authentifie
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "invalid_scope"
    Et le message d'erreur est "your scopes are invalid"

  Scénario: API oidc-callback - bon state mais mauvais code
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je paramètre un intercepteur pour l'appel authorize au fournisseur d'identité "par défaut"
    Et que je clique sur le bouton de connexion
    Et que je prépare une requête "oidc-callback"
    Et que je mets le state fourni par AC dans le paramètre "state" de la requête
    Et que je mets "https://fia1-low.docker.dev-franceconnect.fr" dans le paramètre "iss" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 400
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et le corps de la réponse contient une page web
    Et je suis redirigé vers la page erreur technique
    Et le code d'erreur est "invalid_grant"
    Et le message d'erreur est "grant request is invalid"
