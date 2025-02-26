# Environment variables per instance

⚠️ Types are inferred from config parsing, env vars are always defined as string.

## Instances index

1. [bridge-http-proxy-rie](#bridge-http-proxy-rie)
2. [core-fca-low](#core-fca-low)
3. [csmr-rie](#csmr-rie)
4. [mock-data-provider](#mock-data-provider)

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

### csmr-rie

| Var Name | Inferred type |
|---|---|
| APP_NAME | string |
| App_ENVIRONMENT | string |
| Logger_THRESHOLD | string |
| REQUEST_TIMEOUT | string |
| RieBroker_QUEUE | string |
| RieBroker_URLS | json |

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
