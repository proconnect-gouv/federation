# Environment variables per instance

⚠️ Types are inferred from config parsing, env vars are always defined as string.

## Instances index

1. [bridge-http-proxy-rie](#bridge-http-proxy-rie)
2. [core-fca-low](#core-fca-low)
3. [core-fcp-high](#core-fcp-high)
4. [core-fcp-low](#core-fcp-low)
5. [csmr-account-instance](#csmr-account-instance)
6. [csmr-fraud-instance](#csmr-fraud-instance)
7. [csmr-hsm-high](#csmr-hsm-high)
8. [csmr-rie](#csmr-rie)
9. [csmr-tracks-instance](#csmr-tracks-instance)
10. [csmr-user-preferences-high](#csmr-user-preferences-high)
11. [eidas-bridge](#eidas-bridge)
12. [mock-data-provider](#mock-data-provider)
13. [mock-identity-provider-fca-low](#mock-identity-provider-fca-low)
14. [mock-identity-provider-fcp-high](#mock-identity-provider-fcp-high)
15. [mock-identity-provider-fcp-low](#mock-identity-provider-fcp-low)
16. [mock-rnipp](#mock-rnipp)
17. [mock-service-provider-fca-low](#mock-service-provider-fca-low)
18. [mock-service-provider-fcp-high](#mock-service-provider-fcp-high)
19. [mock-service-provider-fcp-legacy](#mock-service-provider-fcp-legacy)
20. [mock-service-provider-fcp-low](#mock-service-provider-fcp-low)
21. [partners](#partners)
22. [user-dashboard](#user-dashboard)

## Variables


### bridge-http-proxy-rie

| Var Name | Inferred type |
|---|---|
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| Broker_QUEUE | string |
| Broker_URLS | json |
| Logger_THRESHOLD | string |
| REQUEST_TIMEOUT | string |

### core-fca-low

| Var Name | Inferred type |
|---|---|
| AdapterMongo_CLIENT_SECRET_CIPHER_PASS | string |
| AdapterMongo_DECRYPT_CLIENT_SECRET_FEATURE | boolean |
| AdapterMongo_DISABLE_IDP_VALIDATION_ON_LEGACY | boolean |
| App_ASSETS_CACHE_TTL | number |
| App_ASSETS_PATHS | json |
| App_CSP_CONNECT_SRC | json |
| App_CSP_DEFAULT_SRC | json |
| App_CSP_FRAME_ANCESTORS | json |
| App_CSP_IMG_SRC | json |
| App_CSP_SCRIPT_SRC | json |
| App_CSP_STYLE_SRC | json |
| App_DEFAULT_EMAIL_RENATER | string |
| App_DEFAULT_IDP_UID | string |
| App_DSFR_ASSETS_PATHS | json |
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_SP_AUTHORIZED_FQDNS_CONFIGS | json |
| App_VIEWS_PATHS | json |
| Core_ALLOWED_IDP_HINTS | json |
| FQDN | string |
| LoggerLegacy_FILE | string |
| Logger_THRESHOLD | string |
| Mongoose_DATABASE | string |
| Mongoose_HOSTS | string |
| Mongoose_PASSWORD | string |
| Mongoose_TLS | boolean |
| Mongoose_TLS_ALLOW_INVALID_HOST_NAME | boolean |
| Mongoose_TLS_CA_FILE | string |
| Mongoose_TLS_INSECURE | boolean |
| Mongoose_USER | string |
| OidcClient_CRYPTO_ENC_LOCALE_PRIV_KEYS | json |
| OidcClient_FAPI | boolean |
| OidcClient_SCOPE | string |
| OidcProvider_COOKIES_KEYS | json |
| OidcProvider_CRYPTO_SIG_ES256_PRIV_KEYS | json |
| OidcProvider_CRYPTO_SIG_RS256_PRIV_KEYS | json |
| OidcProvider_ERROR_URI_BASE | string |
| OidcProvider_IS_LOCALHOST_ALLOWED | boolean |
| OidcProvider_PREFIX | string |
| OverrideOidcProvider_CRYPTO_SIG_HSM_PUB_KEYS | json |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| Session_COOKIE_SECRETS | json |
| Session_USERINFO_CRYPT_KEY | string |

### core-fcp-high

| Var Name | Inferred type |
|---|---|
| AdapterMongo_CLIENT_SECRET_CIPHER_PASS | string |
| AdapterMongo_DECRYPT_CLIENT_SECRET_FEATURE | boolean |
| AdapterMongo_DISABLE_IDP_VALIDATION_ON_LEGACY | boolean |
| App_ASSETS_CACHE_TTL | number |
| App_ASSETS_PATHS | json |
| App_DSFR_ASSETS_PATHS | json |
| App_EIDAS_BRIDGE_UID | string |
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_SHOW_EXCLUDED_IDP | boolean |
| App_VIEWS_PATHS | json |
| Core_ALLOWED_IDP_HINTS | json |
| Core_SUPPORT_FORM_URL | string |
| CryptographyBroker_QUEUE | string |
| CryptographyBroker_URLS | json |
| Cryptography_CRYPTO_SUB_SECRET | string |
| Device_COOKIE_DOMAIN | string |
| Device_COOKIE_NAME | string |
| Device_IDENTITY_HMAC_DAILY_TTL | number |
| Device_IDENTITY_HMAC_SECRET | json |
| Device_MAX_IDENTITY_NUMBER | number |
| Device_MAX_IDENTITY_TRUSTED | number |
| FQDN | string |
| GLOBAL_AGENT_HTTPS_PROXY | string |
| LoggerLegacy_FILE | string |
| Logger_THRESHOLD | string |
| Mailer_FROM_EMAIL | string |
| Mailer_FROM_NAME | string |
| Mailer_HOST | string |
| Mailer_PORT | number |
| Mailer_SECURE | boolean |
| Mailer_TEMPLATES_PATHS | json |
| Mailer_TRANSPORT | string |
| Mongoose_DATABASE | string |
| Mongoose_HOSTS | string |
| Mongoose_PASSWORD | string |
| Mongoose_TLS | boolean |
| Mongoose_TLS_ALLOW_INVALID_HOST_NAME | boolean |
| Mongoose_TLS_CA_FILE | string |
| Mongoose_TLS_INSECURE | boolean |
| Mongoose_USER | string |
| OidcClient_CRYPTO_ENC_LOCALE_PRIV_KEYS | json |
| OidcClient_FAPI | boolean |
| OidcClient_HTTPS_CLIENT_CERT | file |
| OidcClient_HTTPS_CLIENT_KEY | file |
| OidcClient_JWKS_ENC_ECDH_ES_PRIV_KEYS | json |
| OidcClient_SCOPE | string |
| OidcProvider_COOKIES_KEYS | json |
| OidcProvider_CRYPTO_SIG_FAKE_PRIV_KEYS | json |
| OidcProvider_ERROR_URI_BASE | string |
| OidcProvider_IS_LOCALHOST_ALLOWED | boolean |
| OidcProvider_PREFIX | string |
| OverrideOidcProvider_CRYPTO_SIG_HSM_PUB_KEYS | json |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_NAME | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| Redis_SENTINELS | json |
| Redis_SENTINEL_PASSWORD | string |
| Rnipp_BASEURL | string |
| Rnipp_HOSTNAME | string |
| Rnipp_PROTOCOL | string |
| Session_COOKIE_SECRETS | json |
| Session_USERINFO_CRYPT_KEY | string |
| UD_FQDN | string |

### core-fcp-low

| Var Name | Inferred type |
|---|---|
| AdapterMongo_CLIENT_SECRET_CIPHER_PASS | string |
| AdapterMongo_DECRYPT_CLIENT_SECRET_FEATURE | boolean |
| AdapterMongo_DISABLE_IDP_VALIDATION_ON_LEGACY | boolean |
| AdapterMongo_PLATFORM | string |
| App_AIDANTS_CONNECT_UID | string |
| App_ASSETS_CACHE_TTL | number |
| App_ASSETS_PATHS | json |
| App_DSFR_ASSETS_PATHS | json |
| App_EIDAS_BRIDGE_UID | string |
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_SHOW_EXCLUDED_IDP | boolean |
| App_VIEWS_PATHS | json |
| Core_ALLOWED_IDP_HINTS | json |
| Core_SUPPORT_FORM_URL | string |
| Cryptography_SUB_SECRET | string |
| Device_COOKIE_DOMAIN | string |
| Device_COOKIE_NAME | string |
| Device_IDENTITY_HMAC_DAILY_TTL | number |
| Device_IDENTITY_HMAC_SECRET | json |
| Device_MAX_IDENTITY_NUMBER | number |
| Device_MAX_IDENTITY_TRUSTED | number |
| FQDN | string |
| GLOBAL_AGENT_HTTPS_PROXY | string |
| LoggerLegacy_FILE | string |
| Logger_THRESHOLD | string |
| Mailer_FROM_EMAIL | string |
| Mailer_FROM_NAME | string |
| Mailer_HOST | string |
| Mailer_PORT | number |
| Mailer_SECURE | boolean |
| Mailer_TEMPLATES_PATHS | json |
| Mailer_TRANSPORT | string |
| Mongoose_DATABASE | string |
| Mongoose_HOSTS | string |
| Mongoose_PASSWORD | string |
| Mongoose_TLS | boolean |
| Mongoose_TLS_ALLOW_INVALID_HOST_NAME | boolean |
| Mongoose_TLS_CA_FILE | string |
| Mongoose_TLS_INSECURE | boolean |
| Mongoose_USER | string |
| OidcClient_CRYPTO_ENC_LOCALE_PRIV_KEYS | json |
| OidcClient_FAPI | boolean |
| OidcClient_HTTPS_CLIENT_CERT | file |
| OidcClient_HTTPS_CLIENT_KEY | file |
| OidcClient_SCOPE | string |
| OidcProvider_COOKIES_KEYS | json |
| OidcProvider_CRYPTO_SIG_ES256_PRIV_KEYS | json |
| OidcProvider_CRYPTO_SIG_RS256_PRIV_KEYS | json |
| OidcProvider_ERROR_URI_BASE | string |
| OidcProvider_IS_LOCALHOST_ALLOWED | boolean |
| OidcProvider_PREFIX | string |
| OidcProvider_USE_ENCRYPTION | string |
| OverrideOidcProvider_CRYPTO_SIG_HSM_PUB_KEYS | json |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_NAME | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| Redis_SENTINELS | json |
| Redis_SENTINEL_PASSWORD | string |
| Rnipp_BASEURL | string |
| Rnipp_HOSTNAME | string |
| Rnipp_PROTOCOL | string |
| Session_COOKIE_SECRETS | json |
| Session_USERINFO_CRYPT_KEY | string |
| UD_FQDN | string |

### csmr-account-instance

| Var Name | Inferred type |
|---|---|
| APP_NAME | string |
| AccountBroker_QUEUE | string |
| AccountBroker_URLS | json |
| App_ENVIRONMENT | string |
| Logger_THRESHOLD | string |
| Mongoose_DATABASE | string |
| Mongoose_HOSTS | string |
| Mongoose_PASSWORD | string |
| Mongoose_TLS | boolean |
| Mongoose_TLS_ALLOW_INVALID_HOST_NAME | boolean |
| Mongoose_TLS_CA_FILE | string |
| Mongoose_TLS_INSECURE | boolean |
| Mongoose_USER | string |
| REQUEST_TIMEOUT | string |

### csmr-fraud-instance

| Var Name | Inferred type |
|---|---|
| APP_NAME | string |
| AccountHighBroker_QUEUE | string |
| AccountHighBroker_URLS | json |
| AccountLegacyBroker_QUEUE | string |
| AccountLegacyBroker_URLS | json |
| App_ENVIRONMENT | string |
| App_FRAUD_EMAIL_ADDRESS | string |
| App_FRAUD_EMAIL_RECIPIENT | string |
| Elasticsearch_FRAUD_INDEX | string |
| Elasticsearch_NODES | json |
| Elasticsearch_PASSWORD | string |
| Elasticsearch_USERNAME | string |
| FraudBroker_QUEUE | string |
| FraudBroker_URLS | json |
| GeoIpMaxmind_DATABASE_PATH | string |
| Logger_THRESHOLD | string |
| Mailer_HOST | string |
| Mailer_PORT | number |
| Mailer_REJECT_UNAUTHORIZED | boolean |
| Mailer_SECURE | boolean |
| Mailer_TEMPLATES_PATHS | json |
| Mailer_TRANSPORT | string |
| REQUEST_TIMEOUT | string |

### csmr-hsm-high

| Var Name | Inferred type |
|---|---|
| APP_NAME | string |
| App_ENVIRONMENT | string |
| CryptographyBroker_QUEUE | string |
| CryptographyBroker_URLS | json |
| Hsm_LIB | string |
| Hsm_PIN | string |
| Hsm_SIG_HSM_PUB_KEY_CKA_LABEL | string |
| Hsm_VIRTUAL_HSM_SLOT | number |
| LoggerLegacy_FILE | string |
| Logger_THRESHOLD | string |
| REQUEST_TIMEOUT | string |

### csmr-rie

| Var Name | Inferred type |
|---|---|
| APP_NAME | string |
| App_ENVIRONMENT | string |
| Logger_THRESHOLD | string |
| REQUEST_TIMEOUT | string |
| RieBroker_QUEUE | string |
| RieBroker_URLS | json |

### csmr-tracks-instance

| Var Name | Inferred type |
|---|---|
| APP_NAME | string |
| AccountHighBroker_QUEUE | string |
| AccountHighBroker_URLS | json |
| AccountLegacyBroker_QUEUE | string |
| AccountLegacyBroker_URLS | json |
| App_ENVIRONMENT | string |
| Elasticsearch_NODES | json |
| Elasticsearch_PASSWORD | string |
| Elasticsearch_TRACKS_INDEX | string |
| Elasticsearch_USERNAME | string |
| GeoIpMaxmind_DATABASE_PATH | string |
| Idp_MAPPINGS | json |
| Logger_THRESHOLD | string |
| REQUEST_TIMEOUT | string |
| TracksBroker_QUEUE | string |
| TracksBroker_URLS | json |

### csmr-user-preferences-high

| Var Name | Inferred type |
|---|---|
| APP_NAME | string |
| AdapterMongo_CLIENT_SECRET_CIPHER_PASS | string |
| AdapterMongo_DECRYPT_CLIENT_SECRET_FEATURE | boolean |
| AdapterMongo_DISABLE_IDP_VALIDATION_ON_LEGACY | boolean |
| App_AIDANTS_CONNECT_UID | string |
| App_ENVIRONMENT | string |
| Broker_QUEUE | string |
| Broker_URLS | json |
| Logger_THRESHOLD | string |
| Mongoose_DATABASE | string |
| Mongoose_HOSTS | string |
| Mongoose_PASSWORD | string |
| Mongoose_TLS | boolean |
| Mongoose_TLS_ALLOW_INVALID_HOST_NAME | boolean |
| Mongoose_TLS_CA_FILE | string |
| Mongoose_TLS_INSECURE | boolean |
| Mongoose_USER | string |
| REQUEST_TIMEOUT | string |

### eidas-bridge

| Var Name | Inferred type |
|---|---|
| ApacheIgnite_ENDPOINT | string |
| ApacheIgnite_MAX_RETRY_TIMEOUT | number |
| ApacheIgnite_PASSWORD | string |
| ApacheIgnite_SOCKET_KEEP_ALIVE_ENABLE | boolean |
| ApacheIgnite_SOCKET_KEEP_ALIVE_INITIAL_DELAY | number |
| ApacheIgnite_TLS_CA | file |
| ApacheIgnite_TLS_CERT | file |
| ApacheIgnite_TLS_KEY | file |
| ApacheIgnite_USERNAME | string |
| ApacheIgnite_USE_TLS | boolean |
| App_ASSETS_CACHE_TTL | number |
| App_ASSETS_PATHS | json |
| App_AVAILABLE_COUNTRIES | json |
| App_DSFR_ASSETS_PATHS | json |
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_IDP_ID | string |
| App_VIEWS_PATHS | json |
| Cog_CITY_FILE | string |
| Cog_COUNTRY_FILE | string |
| Cryptography_CRYPTO_SUB_SECRET | string |
| EidasClient_CONNECTOR_REQUEST_CACHE | string |
| EidasClient_CONNECTOR_REQUEST_ISSUER | string |
| EidasClient_CONNECTOR_REQUEST_URL | string |
| EidasClient_CONNECTOR_RESPONSE_CACHE | string |
| EidasClient_REDIRECT_AFTER_RESPONSE_HANDLING_URL | string |
| EidasLightProtocol_LIGHT_REQUEST_CONNECTOR_SECRET | string |
| EidasLightProtocol_LIGHT_REQUEST_PROXY_SERVICE_SECRET | string |
| EidasLightProtocol_LIGHT_RESPONSE_CONNECTOR_SECRET | string |
| EidasLightProtocol_LIGHT_RESPONSE_PROXY_SERVICE_SECRET | string |
| EidasLightProtocol_MAX_TOKEN_SIZE | number |
| EidasProvider_PROXY_SERVICE_REQUEST_CACHE | string |
| EidasProvider_PROXY_SERVICE_RESPONSE_CACHE | string |
| EidasProvider_PROXY_SERVICE_RESPONSE_ISSUER | string |
| EidasProvider_PROXY_SERVICE_RESPONSE_URL | string |
| EidasProvider_REDIRECT_AFTER_REQUEST_HANDLING_URL | string |
| FQDN | string |
| IdentityProviderAdapterEnv_CLIENT_ID | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET_CIPHER_PASS | string |
| IdentityProviderAdapterEnv_DISCOVERY | boolean |
| IdentityProviderAdapterEnv_DISCOVERY_URL | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_JWKS_URI | string |
| IdentityProviderAdapterEnv_NAME | string |
| IdentityProviderAdapterEnv_REVOCATION_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_TITLE | string |
| IdentityProviderAdapterEnv_TOKEN_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_UID | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG | string |
| LoggerLegacy_FILE | string |
| Logger_THRESHOLD | string |
| OidcClient_FAPI | boolean |
| OidcClient_HTTPS_CLIENT_CERT | file |
| OidcClient_HTTPS_CLIENT_KEY | file |
| OidcClient_JWKS | json |
| OidcProvider_COOKIES_KEYS | json |
| OidcProvider_CRYPTO_SIG_FAKE_PRIV_KEYS | json |
| OidcProvider_ERROR_URI_BASE | string |
| OidcProvider_ISSUER | string |
| OidcProvider_PREFIX | string |
| OverrideOidcProvider_CRYPTO_SIG_HSM_PUB_KEYS | json |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| ServiceProviderAdapterEnvHigh_CLIENT_ID | string |
| ServiceProviderAdapterEnvHigh_CLIENT_SECRET | string |
| ServiceProviderAdapterEnvHigh_ID_TOKEN_ENCRYPTED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnvHigh_ID_TOKEN_ENCRYPTED_RESPONSE_ENC | string |
| ServiceProviderAdapterEnvHigh_ID_TOKEN_SIGNED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnvHigh_JWKS_URI | string |
| ServiceProviderAdapterEnvHigh_POST_LOGOUT_REDIRECT_URIS | json |
| ServiceProviderAdapterEnvHigh_REDIRECT_URIS | json |
| ServiceProviderAdapterEnvHigh_SCOPE | string |
| ServiceProviderAdapterEnvHigh_USERINFO_ENCRYPTED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnvHigh_USERINFO_ENCRYPTED_RESPONSE_ENC | string |
| ServiceProviderAdapterEnvHigh_USERINFO_SIGNED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnvLow_CLIENT_ID | string |
| ServiceProviderAdapterEnvLow_CLIENT_SECRET | string |
| ServiceProviderAdapterEnvLow_ID_TOKEN_ENCRYPTED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnvLow_ID_TOKEN_ENCRYPTED_RESPONSE_ENC | string |
| ServiceProviderAdapterEnvLow_ID_TOKEN_SIGNED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnvLow_JWKS_URI | string |
| ServiceProviderAdapterEnvLow_POST_LOGOUT_REDIRECT_URIS | json |
| ServiceProviderAdapterEnvLow_REDIRECT_URIS | json |
| ServiceProviderAdapterEnvLow_SCOPE | string |
| ServiceProviderAdapterEnvLow_USERINFO_ENCRYPTED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnvLow_USERINFO_ENCRYPTED_RESPONSE_ENC | string |
| ServiceProviderAdapterEnvLow_USERINFO_SIGNED_RESPONSE_ALG | string |
| Session_COOKIE_SAMESITE | string |
| Session_COOKIE_SECRETS | json |
| Session_USERINFO_CRYPT_KEY | string |

### mock-data-provider

| Var Name | Inferred type |
|---|---|
| APP_NAME | string |
| App_API_AUTH_SECRET | string |
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| DataProviderAdapterCore_CHECKTOKEN_ENDPOINT | string |
| DataProviderAdapterCore_CHECKTOKEN_JWT_ENCRYPTED_RESPONSE_ALG | string |
| DataProviderAdapterCore_CHECKTOKEN_JWT_ENCRYPTED_RESPONSE_ENC | string |
| DataProviderAdapterCore_CHECKTOKEN_JWT_SIGNED_RESPONSE_ALG | string |
| DataProviderAdapterCore_CLIENT_ID | string |
| DataProviderAdapterCore_CLIENT_SECRET | string |
| DataProviderAdapterCore_ISSUER | string |
| DataProviderAdapterCore_JWKS | json |
| DataProviderAdapterCore_JWKS_ENDPOINT | string |
| Logger_THRESHOLD | string |

### mock-identity-provider-fca-low

| Var Name | Inferred type |
|---|---|
| App_ALLOW_CUSTOM_IDENTITY | boolean |
| App_ASSETS_PATHS | json |
| App_CITIZEN_DATABASE_PATH | string |
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_PASSWORD_VERIFICATION | boolean |
| App_SCENARIOS_DATABASE_PATH | string |
| App_VIEWS_PATHS | json |
| FQDN | string |
| Logger_THRESHOLD | string |
| OidcProvider_COOKIES_KEYS | json |
| OidcProvider_CRYPTO_SIG_ES256_PRIV_KEYS | json |
| OidcProvider_CRYPTO_SIG_RS256_PRIV_KEYS | json |
| OidcProvider_ERROR_URI_BASE | string |
| OidcProvider_PREFIX | string |
| OidcProvider_USE_ENCRYPTION | boolean |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| ServiceProviderAdapterEnv_CLIENT_ID | string |
| ServiceProviderAdapterEnv_CLIENT_SECRET | string |
| ServiceProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ENC | string |
| ServiceProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnv_JWKS_URI | string |
| ServiceProviderAdapterEnv_POST_LOGOUT_REDIRECT_URIS | json |
| ServiceProviderAdapterEnv_REDIRECT_URIS | json |
| ServiceProviderAdapterEnv_SCOPE | string |
| ServiceProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ENC | string |
| ServiceProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG | string |
| Session_COOKIE_SECRETS | json |
| Session_USERINFO_CRYPT_KEY | string |

### mock-identity-provider-fcp-high

| Var Name | Inferred type |
|---|---|
| APP_NAME | string |
| App_ALLOW_CUSTOM_IDENTITY | boolean |
| App_ASSETS_PATHS | json |
| App_CITIZEN_DATABASE_PATH | string |
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_PASSWORD_VERIFICATION | boolean |
| App_SCENARIOS_DATABASE_PATH | string |
| App_VIEWS_PATHS | json |
| FQDN | string |
| Logger_THRESHOLD | string |
| OidcProvider_COOKIES_KEYS | json |
| OidcProvider_CRYPTO_SIG_ES256_PRIV_KEYS | json |
| OidcProvider_CRYPTO_SIG_RS256_PRIV_KEYS | json |
| OidcProvider_ERROR_URI_BASE | string |
| OidcProvider_PREFIX | string |
| OidcProvider_USE_ENCRYPTION | boolean |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| ServiceProviderAdapterEnv_CLIENT_ID | string |
| ServiceProviderAdapterEnv_CLIENT_SECRET | string |
| ServiceProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ENC | string |
| ServiceProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnv_JWKS_URI | string |
| ServiceProviderAdapterEnv_POST_LOGOUT_REDIRECT_URIS | json |
| ServiceProviderAdapterEnv_REDIRECT_URIS | json |
| ServiceProviderAdapterEnv_SCOPE | string |
| ServiceProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ENC | string |
| ServiceProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG | string |
| Session_COOKIE_SECRETS | json |
| Session_USERINFO_CRYPT_KEY | string |

### mock-identity-provider-fcp-low

| Var Name | Inferred type |
|---|---|
| APP_NAME | string |
| App_ALLOW_CUSTOM_IDENTITY | boolean |
| App_ASSETS_PATHS | json |
| App_CITIZEN_DATABASE_PATH | string |
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_PASSWORD_VERIFICATION | boolean |
| App_SCENARIOS_DATABASE_PATH | string |
| App_VIEWS_PATHS | json |
| FQDN | string |
| Logger_THRESHOLD | string |
| OidcProvider_COOKIES_KEYS | json |
| OidcProvider_CRYPTO_SIG_ES256_PRIV_KEYS | json |
| OidcProvider_CRYPTO_SIG_RS256_PRIV_KEYS | json |
| OidcProvider_ERROR_URI_BASE | string |
| OidcProvider_PREFIX | string |
| OidcProvider_USE_ENCRYPTION | boolean |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| ServiceProviderAdapterEnv_CLIENT_ID | string |
| ServiceProviderAdapterEnv_CLIENT_SECRET | string |
| ServiceProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ENC | string |
| ServiceProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnv_JWKS_URI | string |
| ServiceProviderAdapterEnv_POST_LOGOUT_REDIRECT_URIS | json |
| ServiceProviderAdapterEnv_REDIRECT_URIS | json |
| ServiceProviderAdapterEnv_SCOPE | string |
| ServiceProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ALG | string |
| ServiceProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ENC | string |
| ServiceProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG | string |
| Session_COOKIE_SECRETS | json |
| Session_USERINFO_CRYPT_KEY | string |

### mock-rnipp

| Var Name | Inferred type |
|---|---|
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_VIEWS_PATHS | json |
| Logger_THRESHOLD | string |

### mock-service-provider-fca-low

| Var Name | Inferred type |
|---|---|
| App_ASSETS_PATHS | json |
| App_DATA_APIS | json |
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_IDP_ID | string |
| App_VIEWS_PATHS | json |
| FQDN | string |
| IdentityProviderAdapterEnv_CLIENT_ID | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET_CIPHER_PASS | string |
| IdentityProviderAdapterEnv_DISCOVERY | boolean |
| IdentityProviderAdapterEnv_DISCOVERY_URL | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_JWKS_URI | string |
| IdentityProviderAdapterEnv_NAME | string |
| IdentityProviderAdapterEnv_REVOCATION_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_TITLE | string |
| IdentityProviderAdapterEnv_TOKEN_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_UID | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG | string |
| JWKS | string |
| Logger_THRESHOLD | string |
| OidcClient_FAPI | boolean |
| OidcClient_HTTPS_CLIENT_CERT | file |
| OidcClient_HTTPS_CLIENT_KEY | file |
| OidcClient_POST_LOGOUT_REDIRECT_URI | string |
| OidcClient_REDIRECT_URI | string |
| OidcClient_SCOPE | string |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| Session_COOKIE_SECRETS | json |
| Session_FQDN | string |
| Session_USERINFO_CRYPT_KEY | string |

### mock-service-provider-fcp-high

| Var Name | Inferred type |
|---|---|
| App_ASSETS_PATHS | json |
| App_DATA_APIS | json |
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_IDP_ID | string |
| App_VIEWS_PATHS | json |
| FQDN | string |
| IdentityProviderAdapterEnv_CLIENT_ID | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET_CIPHER_PASS | string |
| IdentityProviderAdapterEnv_DISCOVERY | boolean |
| IdentityProviderAdapterEnv_DISCOVERY_URL | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_JWKS_URI | string |
| IdentityProviderAdapterEnv_NAME | string |
| IdentityProviderAdapterEnv_REVOCATION_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_TITLE | string |
| IdentityProviderAdapterEnv_TOKEN_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_UID | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG | string |
| JWKS | string |
| Logger_THRESHOLD | string |
| OidcClient_FAPI | boolean |
| OidcClient_HTTPS_CLIENT_CERT | file |
| OidcClient_HTTPS_CLIENT_KEY | file |
| OidcClient_POST_LOGOUT_REDIRECT_URI | string |
| OidcClient_REDIRECT_URI | string |
| OidcClient_SCOPE | string |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| Session_COOKIE_SECRETS | json |
| Session_USERINFO_CRYPT_KEY | string |

### mock-service-provider-fcp-legacy

| Var Name | Inferred type |
|---|---|
| App_ASSETS_PATHS | json |
| App_DATA_APIS | json |
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_IDP_ID | string |
| App_VIEWS_PATHS | json |
| FQDN | string |
| IdentityProviderAdapterEnv_AUTHORIZATION_ENDPOINT | string |
| IdentityProviderAdapterEnv_CLIENT_ID | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET_CIPHER_PASS | string |
| IdentityProviderAdapterEnv_DISCOVERY | boolean |
| IdentityProviderAdapterEnv_DISCOVERY_URL | string |
| IdentityProviderAdapterEnv_END_SESSION_ENDPOINT | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_ISSUER | string |
| IdentityProviderAdapterEnv_NAME | string |
| IdentityProviderAdapterEnv_REVOCATION_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_TITLE | string |
| IdentityProviderAdapterEnv_TOKEN_ENDPOINT | string |
| IdentityProviderAdapterEnv_TOKEN_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_UID | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_USERINFO_ENDPOINT | string |
| IdentityProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG | string |
| Logger_THRESHOLD | string |
| OidcClient_FAPI | boolean |
| OidcClient_HTTPS_CLIENT_CERT | file |
| OidcClient_HTTPS_CLIENT_KEY | file |
| OidcClient_POST_LOGOUT_REDIRECT_URI | string |
| OidcClient_REDIRECT_URI | string |
| OidcClient_SCOPE | string |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| Session_COOKIE_SECRETS | json |
| Session_USERINFO_CRYPT_KEY | string |

### mock-service-provider-fcp-low

| Var Name | Inferred type |
|---|---|
| App_ASSETS_PATHS | json |
| App_DATA_APIS | json |
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_IDP_ID | string |
| App_VIEWS_PATHS | json |
| FQDN | string |
| IdentityProviderAdapterEnv_CLIENT_ID | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET_CIPHER_PASS | string |
| IdentityProviderAdapterEnv_DISCOVERY | boolean |
| IdentityProviderAdapterEnv_DISCOVERY_URL | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_JWKS_URI | string |
| IdentityProviderAdapterEnv_NAME | string |
| IdentityProviderAdapterEnv_REVOCATION_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_TITLE | string |
| IdentityProviderAdapterEnv_TOKEN_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_UID | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG | string |
| Logger_THRESHOLD | string |
| OidcClient_FAPI | boolean |
| OidcClient_HTTPS_CLIENT_CERT | file |
| OidcClient_HTTPS_CLIENT_KEY | file |
| OidcClient_POST_LOGOUT_REDIRECT_URI | string |
| OidcClient_REDIRECT_URI | string |
| OidcClient_SCOPE | string |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| Session_COOKIE_SECRETS | json |
| Session_USERINFO_CRYPT_KEY | string |

### partners

| Var Name | Inferred type |
|---|---|
| App_ENVIRONMENT | string |
| App_FQDN | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_IDP_ID | string |
| App_NAME | string |
| FQDN | string |
| IdentityProviderAdapterEnv_CLIENT_ID | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET_CIPHER_PASS | string |
| IdentityProviderAdapterEnv_DISCOVERY | boolean |
| IdentityProviderAdapterEnv_DISCOVERY_URL | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_JWKS_URI | string |
| IdentityProviderAdapterEnv_NAME | string |
| IdentityProviderAdapterEnv_REVOCATION_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_TITLE | string |
| IdentityProviderAdapterEnv_TOKEN_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_UID | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG | string |
| Logger_THRESHOLD | string |
| OidcClient_FAPI | boolean |
| OidcClient_HTTPS_CLIENT_CERT | file |
| OidcClient_HTTPS_CLIENT_KEY | file |
| OidcClient_JWKS | json |
| OidcClient_POST_LOGOUT_REDIRECT_URI | string |
| OidcClient_REDIRECT_URI | string |
| OidcClient_SCOPE | string |
| Postgres_DATABASE | string |
| Postgres_HOST | string |
| Postgres_PASSWORD | string |
| Postgres_PORT | number |
| Postgres_SSL_CA | file |
| Postgres_SSL_CERT | file |
| Postgres_SSL_KEY | file |
| Postgres_SSL_REJECT_UNAUTHORIZED | boolean |
| Postgres_USER | string |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_NAME | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| Redis_SENTINELS | json |
| Redis_SENTINEL_PASSWORD | string |
| Session_COOKIE_SECRETS | json |
| Session_ENCRYPTION_KEY | string |

### user-dashboard

| Var Name | Inferred type |
|---|---|
| App_ENVIRONMENT | string |
| App_HTTPS_SERVER_CERT | file |
| App_HTTPS_SERVER_KEY | file |
| App_IDP_ID | string |
| FQDN | string |
| FraudBroker_QUEUE | string |
| FraudBroker_URLS | json |
| IdentityProviderAdapterEnv_CLIENT_ID | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET | string |
| IdentityProviderAdapterEnv_CLIENT_SECRET_CIPHER_PASS | string |
| IdentityProviderAdapterEnv_DISCOVERY | boolean |
| IdentityProviderAdapterEnv_DISCOVERY_URL | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_JWKS_URI | string |
| IdentityProviderAdapterEnv_NAME | string |
| IdentityProviderAdapterEnv_REVOCATION_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_TITLE | string |
| IdentityProviderAdapterEnv_TOKEN_ENDPOINT_AUTH_METHOD | string |
| IdentityProviderAdapterEnv_UID | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ALG | string |
| IdentityProviderAdapterEnv_USERINFO_ENCRYPTED_RESPONSE_ENC | string |
| IdentityProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG | string |
| LoggerLegacy_FILE | string |
| Logger_THRESHOLD | string |
| Mailer_FROM_EMAIL | string |
| Mailer_FROM_NAME | string |
| Mailer_HOST | string |
| Mailer_PORT | number |
| Mailer_SECURE | boolean |
| Mailer_TEMPLATES_PATHS | json |
| Mailer_TRANSPORT | string |
| OidcClient_FAPI | boolean |
| OidcClient_HTTPS_CLIENT_CERT | file |
| OidcClient_HTTPS_CLIENT_KEY | file |
| OidcClient_JWKS | json |
| OidcClient_POST_LOGOUT_REDIRECT_URI | string |
| OidcClient_REDIRECT_URI | string |
| OidcClient_SCOPE | string |
| REQUEST_TIMEOUT | string |
| Redis_CACERT | file |
| Redis_DB | number |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE | boolean |
| Redis_HOST | string |
| Redis_NAME | string |
| Redis_PASSWORD | string |
| Redis_PORT | number |
| Redis_SENTINELS | json |
| Redis_SENTINEL_PASSWORD | string |
| Session_COOKIE_SECRETS | json |
| Session_ENCRYPTION_KEY | string |
| TracksBroker_QUEUE | string |
| TracksBroker_URLS | json |
| UserPreferencesBroker_QUEUE | string |
| UserPreferencesBroker_URLS | json |
