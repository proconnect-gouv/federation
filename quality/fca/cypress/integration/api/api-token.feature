#language: fr
@ignoreInteg01
Fonctionnalité: API - token

Scénario: API token - cas nominal
  Etant donné que je navigue sur la page fournisseur de service
  Et que je paramètre un intercepteur pour l'appel à la redirect_uri du fournisseur de service "par défaut"
  Et que le fournisseur de service demande un niveau de sécurité "eidas1" via acr_values
  Et que je clique sur le bouton ProConnect
  Et que j'entre l'email "test@fia1.fr"
  Et que je clique sur le bouton de connexion
  Et que je m'authentifie
  Et que je prépare une requête "token"
  Et que je mets le code renvoyé par PC au FS dans la propriété "code" du corps de la requête
  Quand je lance la requête
  Alors le statut de la réponse est 200
  Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
  Et l'entête de la réponse n'a pas de propriété "set-cookie"
  Et le corps de la réponse a 6 propriétés
  Et le corps de la réponse a une propriété "access_token"
  Et le corps de la réponse a une propriété "refresh_token"
  Et le corps de la réponse a une propriété "expires_in" égale à 60
  Et le corps de la réponse a une propriété "id_token"
  Et le corps de la réponse a une propriété "scope"
  Et le corps de la réponse a une propriété "token_type" égale à "Bearer"
  Et le corps de la réponse contient le JWT id_token pour le FS
  Et le JWT n'est pas chiffré
  Et l'entête du JWS a une propriété "alg" égale à "HS256"
  Et le payload du JWT a une propriété "sub"
  Et le payload du JWT a une propriété "acr" égale à "eidas1"
  Et le payload du JWT a une propriété "amr"
  Et le payload du JWT a une propriété "nonce"
  Et le payload du JWT a une propriété "iss" égale à "https://core-fca-low.docker.dev-franceconnect.fr/api/v2"

Scénario: API token - code invalide
  Etant donné que je prépare une requête "token"
  Et que je mets "invalid-code" dans la propriété "code" du corps de la requête
  Quand je lance la requête
  Alors le statut de la réponse est 400
  Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
  Et l'entête de la réponse n'a pas de propriété "set-cookie"
  Et le corps de la réponse contient une erreur avec les champs error et error_description
  Et le corps de la réponse a une propriété "error" égale à "invalid_grant"
  Et le corps de la réponse a une propriété "error_description" égale à "grant request is invalid (authorization code not found)"

Scénario: API token - id_token
  Etant donné que je navigue sur la page fournisseur de service
  Et que je paramètre un intercepteur pour l'appel à la redirect_uri du fournisseur de service "par défaut"
  Et que le fournisseur de service demande un niveau de sécurité "eidas1" via acr_values
  Et que je clique sur le bouton ProConnect
  Et que j'entre l'email "test@fia1.fr"
  Et que je clique sur le bouton de connexion
  Et que je m'authentifie
  Et que je prépare une requête "token"
  Et que je mets le code renvoyé par PC au FS dans la propriété "code" du corps de la requête
  Quand je lance la requête
  Alors le statut de la réponse est 200
  Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
  Et l'entête de la réponse n'a pas de propriété "set-cookie"
  Et le corps de la réponse a 6 propriétés
  Et le corps de la réponse a une propriété "access_token"
  Et le corps de la réponse a une propriété "refresh_token"
  Et le corps de la réponse a une propriété "expires_in" égale à 60
  Et le corps de la réponse a une propriété "id_token"
  Et le corps de la réponse a une propriété "scope"
  Et le corps de la réponse a une propriété "token_type" égale à "Bearer"
  Et le corps de la réponse contient le JWT id_token pour le FS
  Et le JWT n'est pas chiffré
  Et l'entête du JWS a une propriété "alg" égale à "HS256"
  Et le payload du JWT a une propriété "nonce"
  Et le payload du JWT a une propriété "sub"
  Et le payload du JWT a une propriété "acr" égale à "eidas1"
  Et le payload du JWT a une propriété "amr"
  Et le payload du JWT a une propriété "iss" égale à "https://core-fca-low.docker.dev-franceconnect.fr/api/v2"

Scénario: API token - PKCE sans client_secret
  Etant donné que je navigue sur la page fournisseur de service
  Et que je paramètre un intercepteur pour l'appel à la redirect_uri du fournisseur de service "par défaut"
  Et que je clique sur le bouton ProConnect PKCE
  Et que j'entre l'email "test@fia1.fr"
  Et que je clique sur le bouton de connexion
  Et que je m'authentifie
  Et que je prépare une requête "token-pkce"
  Et que je mets le code renvoyé par PC au FS dans la propriété "code" du corps de la requête
  Et que je retire "client_secret" du corps de la requête
  Quand je lance la requête
  Alors le statut de la réponse est 401
  Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
  Et l'entête de la réponse n'a pas de propriété "set-cookie"
  Et le corps de la réponse contient une erreur avec les champs error et error_description
  Et le corps de la réponse a une propriété "error" égale à "invalid_client"
  Et le corps de la réponse a une propriété "error_description" égale à "client authentication failed (the registered client token_endpoint_auth_method does not match the provided auth mechanism)"

Scénario: API token - code_verifier invalide
  Etant donné que je navigue sur la page fournisseur de service
  Et que je paramètre un intercepteur pour l'appel à la redirect_uri du fournisseur de service "par défaut"
  Et que je clique sur le bouton ProConnect PKCE
  Et que j'entre l'email "test@fia1.fr"
  Et que je clique sur le bouton de connexion
  Et que je m'authentifie
  Et que je prépare une requête "token-pkce"
  Et que je mets le code renvoyé par PC au FS dans la propriété "code" du corps de la requête
  Et que je mets "invalid-code_verifier-123456789012345678901234567890" dans la propriété "code_verifier" du corps de la requête
  Quand je lance la requête
  Alors le statut de la réponse est 400
  Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
  Et l'entête de la réponse n'a pas de propriété "set-cookie"
  Et le corps de la réponse contient une erreur avec les champs error et error_description
  Et le corps de la réponse a une propriété "error" égale à "invalid_grant"
  Et le corps de la réponse a une propriété "error_description" égale à "grant request is invalid (PKCE verification failed)"

Scénario: API token - refresh token
  Etant donné que je navigue sur la page fournisseur de service
  Et que je paramètre un intercepteur pour l'appel à la redirect_uri du fournisseur de service "par défaut"
  Et que le fournisseur de service demande un niveau de sécurité "eidas1" via acr_values
  Et que je clique sur le bouton ProConnect
  Et que j'entre l'email "test@fia1.fr"
  Et que je clique sur le bouton de connexion
  Et que je m'authentifie
  Et que je prépare une requête "token"
  Et que je mets le code renvoyé par PC au FS dans la propriété "code" du corps de la requête
  Et que je lance la requête
  Et que je mémorise la propriété "refresh_token" du corps de la réponse
  Quand je prépare une requête "token-from-refresh-token"
  Et que je mets la donnée mémorisée "refresh_token" dans la propriété "refresh_token" du corps de la requête
  Et que je lance la requête
  Alors le statut de la réponse est 200
  Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
  Et l'entête de la réponse n'a pas de propriété "set-cookie"
  Et le corps de la réponse a 6 propriétés
  Et le corps de la réponse a une propriété "access_token"
  Et le corps de la réponse a une propriété "refresh_token"
  Et le corps de la réponse a une propriété "expires_in" égale à 60
  Et le corps de la réponse a une propriété "id_token"
  Et le corps de la réponse a une propriété "scope"
  Et le corps de la réponse a une propriété "token_type" égale à "Bearer"
  Et le corps de la réponse contient le JWT id_token pour le FS
  Et le JWT n'est pas chiffré
  Et l'entête du JWS a une propriété "alg" égale à "HS256"
  Et le payload du JWT a une propriété "sub"
  Et le payload du JWT a une propriété "acr" égale à "eidas1"
  Et le payload du JWT a une propriété "amr"
  Et le payload du JWT a une propriété "nonce"
  Et le payload du JWT a une propriété "iss" égale à "https://core-fca-low.docker.dev-franceconnect.fr/api/v2"

Scénario: API token - refresh token invalide
  Etant donné que je navigue sur la page fournisseur de service
  Et que je prépare une requête "token-from-refresh-token"
  Quand je lance la requête
  Alors le statut de la réponse est 400
  Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
  Et l'entête de la réponse n'a pas de propriété "set-cookie"
  Et le corps de la réponse contient une erreur avec les champs error et error_description
  Et le corps de la réponse a une propriété "error" égale à "invalid_grant"
  Et le corps de la réponse a une propriété "error_description" égale à "grant request is invalid (refresh token not found)"

Scénario: API token - refresh token révoqué
  Etant donné que je navigue sur la page fournisseur de service
  Et que je paramètre un intercepteur pour l'appel à la redirect_uri du fournisseur de service "par défaut"
  Et que je clique sur le bouton ProConnect
  Et que j'entre l'email "test@fia1.fr"
  Et que je clique sur le bouton de connexion
  Et que je m'authentifie
  Et que je prépare une requête "token"
  Et que je mets le code renvoyé par PC au FS dans la propriété "code" du corps de la requête
  Et que je lance la requête
  Et que je mémorise la propriété "refresh_token" du corps de la réponse
  Et que je prépare une requête "revoke"
  Et que je mets la donnée mémorisée "refresh_token" dans la propriété "token" du corps de la requête
  Et que je lance la requête
  Et que le statut de la réponse est 200
  Quand je prépare une requête "token-from-refresh-token"
  Et que je mets la donnée mémorisée "refresh_token" dans la propriété "refresh_token" du corps de la requête
  Et que je lance la requête
  Alors le statut de la réponse est 400
  Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
  Et l'entête de la réponse n'a pas de propriété "set-cookie"
  Et le corps de la réponse contient une erreur avec les champs error et error_description
  Et le corps de la réponse a une propriété "error" égale à "invalid_grant"
  Et le corps de la réponse a une propriété "error_description" égale à "grant request is invalid (refresh token not found)"
