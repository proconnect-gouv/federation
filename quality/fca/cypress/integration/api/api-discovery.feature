#language: fr
@apiDiscovery
Fonctionnalité: API - discovery

  Scénario: API discovery - fca-low
    Etant donné que je prépare une requête "discovery"
    Quand je lance la requête
    Alors le statut de la réponse est 200
    Et l'entête de la réponse a une propriété "content-type" contenant "application/json"
    Et l'entête de la réponse n'a pas de propriété "set-cookie"
    Et le corps de la réponse contient une configuration openid
    Et "acr_values_supported" contient uniquement "eidas1 eidas2 eidas3 https://proconnect.gouv.fr/assurance/self-asserted https://proconnect.gouv.fr/assurance/self-asserted-2fa https://proconnect.gouv.fr/assurance/consistency-checked https://proconnect.gouv.fr/assurance/consistency-checked-2fa https://proconnect.gouv.fr/assurance/certification-dirigeant" dans la configuration openid
    Et "scopes_supported" contient "openid given_name usual_name email siren siret organizational_unit belonging_population phone chorusdt" dans la configuration openid
    Et "scopes_supported" ne contient pas "offline_access" dans la configuration openid
    Et "claims_supported" contient "sub amr uid given_name email phone_number organizational_unit siren siret usual_name belonging_population chorusdt:matricule chorusdt:societe chorusdt:societe idp_id idp_acr is_service_public acr sid auth_time iss" dans la configuration openid
    Et "id_token_signing_alg_values_supported" contient uniquement "HS256 ES256 RS256" dans la configuration openid
    Et "userinfo_signing_alg_values_supported" contient uniquement "HS256 ES256 RS256" dans la configuration openid
