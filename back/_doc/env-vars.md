# Environment variables per instance

⚠️ Types are inferred from config parsing, env vars are always defined as string.

## Instances index

1. [core-fca-low](#core-fca-low)
2. [csmr-rie](#csmr-rie)

## Variables

### core-fca-low

| Var Name                                        | Inferred type |
| ----------------------------------------------- | ------------- |
| AdapterMongo_CLIENT_SECRET_CIPHER_PASS          | string        |
| AdapterMongo_DECRYPT_CLIENT_SECRET_FEATURE      | boolean       |
| ApiEntreprise_API_BASE_URL                      | string        |
| ApiEntreprise_API_TOKEN                         | string        |
| ApiEntreprise_FEATURE_FETCH_ORGANIZATION_DATA   | boolean       |
| ApiEntreprise_SHOULD_MOCK_API                   | boolean       |
| App_ASSETS_CACHE_TTL                            | number        |
| App_ASSETS_PATHS                                | json          |
| App_DEFAULT_EMAIL_RENATER                       | string        |
| App_DEFAULT_IDP_UID                             | string        |
| App_DSFR_ASSETS_PATHS                           | json          |
| App_FEATURE_DISPLAY_MAINTENANCE_NOTICE          | boolean       |
| App_FEATURE_DISPLAY_TEST_ENV_WARNING            | boolean       |
| App_HTTPS_SERVER_CERT                           | file          |
| App_HTTPS_SERVER_KEY                            | file          |
| App_MAINTENANCE_DATETIME                        | string        |
| App_MAINTENANCE_DURATION                        | string        |
| App_SP_AUTHORIZED_FQDNS_CONFIGS                 | json          |
| App_VERIFICATION_EMAIL_PERCENTAGE               | number        |
| App_VIEWS_PATHS                                 | json          |
| EmailValidator_DOMAIN_WHITELIST                 | stringArray   |
| EmailValidator_FEATURE_MX_RESOLUTION_VALIDATION | boolean       |
| FQDN                                            | string        |
| HyyyperbridgeBroker_QUEUE                       | string        |
| HyyyperbridgeBroker_URLS                        | json          |
| Logger_THRESHOLD                                | string        |
| Mailer_BREVO_API_KEY                            | string        |
| Mailer_FROM_EMAIL                               | string        |
| Mailer_FROM_NAME                                | string        |
| Mailer_SMTP_URL                                 | string        |
| Mailer_TRANSPORT                                | string        |
| Mongoose_DATABASE                               | string        |
| Mongoose_HOSTS                                  | string        |
| Mongoose_PASSWORD                               | string        |
| Mongoose_TLS                                    | boolean       |
| Mongoose_TLS_ALLOW_INVALID_HOST_NAME            | boolean       |
| Mongoose_TLS_CA_FILE                            | string        |
| Mongoose_TLS_INSECURE                           | boolean       |
| Mongoose_USER                                   | string        |
| Mongoose_WATCHER_DEBOUNCE_WAIT_DURATION         | number        |
| OidcClient_CRYPTO_ENC_LOCALE_PRIV_KEYS          | json          |
| OidcClient_FEATURE_ENABLE_HYYYPERBRIDGE         | boolean       |
| OidcProvider_COOKIES_KEYS                       | json          |
| OidcProvider_CRYPTO_SIG_ES256_PRIV_KEYS         | json          |
| OidcProvider_CRYPTO_SIG_RS256_PRIV_KEYS         | json          |
| OidcProvider_ERROR_URI_BASE                     | string        |
| OidcProvider_PREFIX                             | string        |
| REQUEST_TIMEOUT                                 | string        |
| Redis_CACERT                                    | file          |
| Redis_DB                                        | number        |
| Redis_ENABLE_TLS_FOR_SENTINEL_MODE              | boolean       |
| Redis_HOST                                      | string        |
| Redis_NAME                                      | string        |
| Redis_PASSWORD                                  | string        |
| Redis_PORT                                      | number        |
| Redis_SENTINELS                                 | stringArray   |
| Redis_SENTINEL_PASSWORD                         | string        |
| Session_COOKIE_SECRETS                          | json          |
| Session_USERINFO_CRYPT_KEY                      | string        |

### csmr-rie

| Var Name         | Inferred type |
| ---------------- | ------------- |
| APP_NAME         | string        |
| Logger_THRESHOLD | string        |
| REQUEST_TIMEOUT  | string        |
| RieBroker_QUEUE  | string        |
| RieBroker_URLS   | json          |
