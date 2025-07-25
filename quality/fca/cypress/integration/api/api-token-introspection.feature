#language: fr
@ignoreInteg01
Fonctionnalité: API - token-introspection
  Scénario: Cas nominal
    Etant donné que je prépare une requête "token-introspection"
    Quand je lance la requête
    Alors le statut de la réponse est 200
    Et l'entête de la réponse a une propriété "content-type" égale à "application/token-introspection+jwt; charset=utf-8"
    Et l'entête de la réponse n'a pas de propriété "set-cookie"
    Et le corps de la réponse contient un JWT d'introspection
    Et l'entête du JWE a une propriété "alg" égale à "ECDH-ES"
    Et l'entête du JWS a une propriété "alg" égale à "ES256"
    Et le payload du JWT a 4 propriétés
    Et le payload du JWT a une propriété "token_introspection"
    Et le payload du JWT a une propriété "aud"
    Et le payload du JWT a une propriété "iat"
    Et le payload du JWT a une propriété "iss"

  Scénario: client_id manquant
    Etant donné que je prépare une requête "token-introspection"
    Et que je retire "client_id" du corps de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 400
    Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
    Et l'entête de la réponse n'a pas de propriété "set-cookie"
    Et le corps de la réponse contient une erreur avec les champs error et error_description
    Et le corps de la réponse a une propriété "error" égale à "invalid_request"
    Et le corps de la réponse a une propriété "error_description" égale à "no client authentication mechanism provided (undefined)"

  Scénario: client_secret manquant
    Etant donné que je prépare une requête "token-introspection"
    Et que je retire "client_secret" du corps de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 401
    Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
    Et l'entête de la réponse n'a pas de propriété "set-cookie"
    Et le corps de la réponse contient une erreur avec les champs error et error_description
    Et le corps de la réponse a une propriété "error" égale à "invalid_client"
    Et le corps de la réponse a une propriété "error_description" égale à "client authentication failed (the registered client introspection_endpoint_auth_method does not match the provided auth mechanism)"

  Scénario: token manquant
    Etant donné que je prépare une requête "token-introspection"
    Et que je retire "token" du corps de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 400
    Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
    Et l'entête de la réponse n'a pas de propriété "set-cookie"
    Et le corps de la réponse contient une erreur avec les champs error et error_description
    Et le corps de la réponse a une propriété "error" égale à "invalid_request"
    Et le corps de la réponse a une propriété "error_description" égale à "missing required parameter 'token' (undefined)"

  Scénario: Authentification client_secret invalide
    Etant donné que je prépare une requête "token-introspection"
    Et que je mets "invalidclientsecret" dans la propriété "client_secret" du corps de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 401
    Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
    Et l'entête de la réponse n'a pas de propriété "set-cookie"
    Et le corps de la réponse contient une erreur avec les champs error et error_description
    Et le corps de la réponse a une propriété "error" égale à "invalid_client"
    Et le corps de la réponse a une propriété "error_description" égale à "client authentication failed (invalid secret provided)"

  Scénario: Authentification client_id invalide
    Etant donné que je prépare une requête "token-introspection"
    Et que je mets "invalidclientid" dans la propriété "client_id" du corps de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 401
    Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
    Et l'entête de la réponse n'a pas de propriété "set-cookie"
    Et le corps de la réponse contient une erreur avec les champs error et error_description
    Et le corps de la réponse a une propriété "error" égale à "invalid_client"
    Et le corps de la réponse a une propriété "error_description" égale à "client authentication failed (client not found)"
