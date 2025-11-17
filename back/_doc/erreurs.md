# Codes d’erreur généraux



## @fc/oidc-client
| Code d'erreur | Classe | Code HTTP | error | error_description |
|---|---|---|---|---|
| [<b>020017</b>](../libs/oidc-client/src/exceptions/oidc-client-idp-disabled.exception.ts) | [OidcClientIdpDisabledException](../libs/oidc-client/src/exceptions/oidc-client-idp-disabled.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>020019</b>](../libs/oidc-client/src/exceptions/oidc-client-idp-not-found.exception.ts) | [OidcClientIdpNotFoundException](../libs/oidc-client/src/exceptions/oidc-client-idp-not-found.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>020021</b>](../libs/oidc-client/src/exceptions/oidc-client-missing-state.exception.ts) | [OidcClientMissingStateException](../libs/oidc-client/src/exceptions/oidc-client-missing-state.exception.ts) | 400 | invalid_request | authentication aborted due to a technical error on the authorization server |
| [<b>020022</b>](../libs/oidc-client/src/exceptions/oidc-client-invalid-state.exception.ts) | [OidcClientInvalidStateException](../libs/oidc-client/src/exceptions/oidc-client-invalid-state.exception.ts) | 403 | invalid_request | invalid state parameter |
| [<b>020026</b>](../libs/oidc-client/src/exceptions/oidc-client-token-failed.exception.ts) | [OidcClientTokenFailedException](../libs/oidc-client/src/exceptions/oidc-client-token-failed.exception.ts) | 502 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>020027</b>](../libs/oidc-client/src/exceptions/oidc-client-userinfo-failed.exception.ts) | [OidcClientUserinfoFailedException](../libs/oidc-client/src/exceptions/oidc-client-userinfo-failed.exception.ts) | 502 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>020028</b>](../libs/oidc-client/src/exceptions/oidc-client-get-end-session-url.exception.ts) | [OidcClientGetEndSessionUrlException](../libs/oidc-client/src/exceptions/oidc-client-get-end-session-url.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>020030</b>](../libs/oidc-client/src/exceptions/oidc-client-token-result-failed.exception.ts) | [OidcClientTokenResultFailedException](../libs/oidc-client/src/exceptions/oidc-client-token-result-failed.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>020031</b>](../libs/oidc-client/src/exceptions/oidc-client-issuer-discovery-failed.exception.ts) | [OidcClientIssuerDiscoveryFailedException](../libs/oidc-client/src/exceptions/oidc-client-issuer-discovery-failed.exception.ts) | 502 | server_error | authentication aborted due to a technical error on the authorization server |

## @fc/oidc-provider
| Code d'erreur | Classe | Code HTTP | error | error_description |
|---|---|---|---|---|
| [<b>030002</b>](../libs/oidc-provider/src/exceptions/oidc-provider-initialisation.exception.ts) | [OidcProviderInitialisationException](../libs/oidc-provider/src/exceptions/oidc-provider-initialisation.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>030005</b>](../libs/oidc-provider/src/exceptions/oidc-provider-stringify-payload-for-redis.exception.ts) | [OidcProviderStringifyPayloadForRedisException](../libs/oidc-provider/src/exceptions/oidc-provider-stringify-payload-for-redis.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>030006</b>](../libs/oidc-provider/src/exceptions/oidc-provider-parse-redis-response.exception.ts) | [OidcProviderParseRedisResponseException](../libs/oidc-provider/src/exceptions/oidc-provider-parse-redis-response.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |

## @fc/cryptography
| Code d'erreur | Classe | Code HTTP | error | error_description |
|---|---|---|---|---|
| [<b>160004</b>](../libs/cryptography/src/exceptions/password-hash-failure.exception.ts) | [PasswordHashFailure](../libs/cryptography/src/exceptions/password-hash-failure.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>160005</b>](../libs/cryptography/src/exceptions/low-entropy-argument.exception.ts) | [LowEntropyArgumentException](../libs/cryptography/src/exceptions/low-entropy-argument.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |

## @fc/session
| Code d'erreur | Classe | Code HTTP | error | error_description |
|---|---|---|---|---|
| [<b>190001</b>](../libs/session/src/exceptions/session-not-found.exception.ts) | [SessionNotFoundException](../libs/session/src/exceptions/session-not-found.exception.ts) | 401 | access_denied | user authentication aborted |
| [<b>190002</b>](../libs/session/src/exceptions/session-bad-format.exception.ts) | [SessionBadFormatException](../libs/session/src/exceptions/session-bad-format.exception.ts) | 500 | access_denied | user authentication aborted |
| [<b>190003</b>](../libs/session/src/exceptions/session-bad-alias.exception.ts) | [SessionBadAliasException](../libs/session/src/exceptions/session-bad-alias.exception.ts) | 500 | access_denied | user authentication aborted |
| [<b>190005</b>](../libs/session/src/exceptions/session-storage.exception.ts) | [SessionStorageException](../libs/session/src/exceptions/session-storage.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>190008</b>](../libs/session/src/exceptions/session-bad-stringify.exception.ts) | [SessionBadStringifyException](../libs/session/src/exceptions/session-bad-stringify.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>190012</b>](../libs/session/src/exceptions/session-bad-cookie.exception.ts) | [SessionBadCookieException](../libs/session/src/exceptions/session-bad-cookie.exception.ts) | 401 | access_denied | user authentication aborted |
| [<b>190013</b>](../libs/session/src/exceptions/session-cannot-commit-undefined-session.exception.ts) | [SessionCannotCommitUndefinedSession](../libs/session/src/exceptions/session-cannot-commit-undefined-session.exception.ts) | 500 | access_denied | user authentication aborted |
| [<b>190014</b>](../libs/session/src/exceptions/session-alias-not-found.exception.ts) | [SessionAliasNotFoundException](../libs/session/src/exceptions/session-alias-not-found.exception.ts) | 500 | access_denied | user authentication aborted |

## @fc/csv
| Code d'erreur | Classe | Code HTTP | error | error_description |
|---|---|---|---|---|
| [<b>250001</b>](../libs/csv/src/exceptions/csv-parsing.exception.ts) | [CsvParsingException](../libs/csv/src/exceptions/csv-parsing.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |

## @fc/bridge-http-proxy-rie
| Code d'erreur | Classe | Code HTTP | error | error_description |
|---|---|---|---|---|
| [<b>300001</b>](../apps/bridge-http-proxy-rie/src/exceptions/bridge-http-proxy-rabbitmq.exception.ts) | [BridgeHttpProxyRabbitmqException](../apps/bridge-http-proxy-rie/src/exceptions/bridge-http-proxy-rabbitmq.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>300002</b>](../apps/bridge-http-proxy-rie/src/exceptions/bridge-http-proxy-variable-missing.exception.ts) | [BridgeHttpProxyMissingVariableException](../apps/bridge-http-proxy-rie/src/exceptions/bridge-http-proxy-variable-missing.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>300003</b>](../apps/bridge-http-proxy-rie/src/exceptions/bridge-http-proxy-csmr.exception.ts) | [BridgeHttpProxyCsmrException](../apps/bridge-http-proxy-rie/src/exceptions/bridge-http-proxy-csmr.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |

## @fc/async-local-storage
| Code d'erreur | Classe | Code HTTP | error | error_description |
|---|---|---|---|---|
| [<b>450001</b>](../libs/async-local-storage/src/exceptions/async-local-storage-not-found.exception.ts) | [AsyncLocalStorageNotFoundException](../libs/async-local-storage/src/exceptions/async-local-storage-not-found.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |

## @fc/csrf
| Code d'erreur | Classe | Code HTTP | error | error_description |
|---|---|---|---|---|
| [<b>470001</b>](../libs/csrf/src/exceptions/csrf-bad-token.exception.ts) | [CsrfBadTokenException](../libs/csrf/src/exceptions/csrf-bad-token.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>470002</b>](../libs/csrf/src/exceptions/csrf-missing-token.exception.ts) | [CsrfMissingTokenException](../libs/csrf/src/exceptions/csrf-missing-token.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |

## @fc/core-fca-low
| Code d'erreur | Classe | Code HTTP | error | error_description |
|---|---|---|---|---|
| [<b>500001</b>](../apps/core-fca-low/src/exceptions/core-fca-no-idp.exception.ts) | [CoreFcaAgentNoIdpException](../apps/core-fca-low/src/exceptions/core-fca-no-idp.exception.ts) | 400 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>500006</b>](../apps/core-fca-low/src/exceptions/core-fca-invalid-identity.exception.ts) | [CoreFcaInvalidIdentityException](../apps/core-fca-low/src/exceptions/core-fca-invalid-identity.exception.ts) | 400 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>500015</b>](../apps/core-fca-low/src/exceptions/core-fca-agent-not-from-public-service.exception.ts) | [CoreFcaAgentNotFromPublicServiceException](../apps/core-fca-low/src/exceptions/core-fca-agent-not-from-public-service.exception.ts) | 400 | access_denied | authentication aborted due to invalid identity |
| [<b>500017</b>](../apps/core-fca-low/src/exceptions/core-fca-idp-disabled.exception.ts) | [CoreFcaAgentIdpDisabledException](../apps/core-fca-low/src/exceptions/core-fca-idp-disabled.exception.ts) | 400 | server_error | authentication aborted due to a technical error on the authorization server |
| [<b>500024</b>](../libs/account-fca/src/exceptions/core-fca-account-blocked.exception.ts) | [CoreFcaAgentAccountBlockedException](../libs/account-fca/src/exceptions/core-fca-account-blocked.exception.ts) | 400 | access_denied | authentication aborted due to invalid identity |
| [<b>500025</b>](../apps/core-fca-low/src/exceptions/core-fca-unauthorized-email.exception.ts) | [CoreFcaUnauthorizedEmailException](../apps/core-fca-low/src/exceptions/core-fca-unauthorized-email.exception.ts) | 400 | access_denied | authentication aborted due to a configuration limitation |
| [<b>500026</b>](../apps/core-fca-low/src/exceptions/core-fca-idp-configuration.exception.ts) | [CoreFcaIdpConfigurationException](../apps/core-fca-low/src/exceptions/core-fca-idp-configuration.exception.ts) | 500 | server_error | authentication aborted due to a technical error on the authorization server |
