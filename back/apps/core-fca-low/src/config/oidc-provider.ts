import { ConfigParser } from '@fc/config';
import {
  OidcProviderConfig,
  OidcProviderPrompt,
  OidcProviderRoutes,
} from '@fc/oidc-provider';

const env = new ConfigParser(process.env, 'OidcProvider');

export default {
  forcedPrompt: [OidcProviderPrompt.LOGIN],
  allowedPrompt: [
    OidcProviderPrompt.LOGIN,
    OidcProviderPrompt.CONSENT,
    OidcProviderPrompt.NONE,
  ],
  prefix: env.string('PREFIX'),
  issuer: `https://${process.env.FQDN}${env.string('PREFIX')}`,
  configuration: {
    routes: {
      authorization: OidcProviderRoutes.AUTHORIZATION,
      check_session: OidcProviderRoutes.CHECK_SESSION,
      code_verification: OidcProviderRoutes.CODE_VERIFICATION,
      device_authorization: OidcProviderRoutes.DEVICE_AUTHORIZATION,
      end_session: OidcProviderRoutes.END_SESSION,
      introspection: OidcProviderRoutes.INTROSPECTION,
      jwks: OidcProviderRoutes.JWKS,
      pushed_authorization_request:
        OidcProviderRoutes.PUSHED_AUTHORIZATION_REQUEST,
      registration: OidcProviderRoutes.REGISTRATION,
      revocation: OidcProviderRoutes.REVOCATION,
      token: OidcProviderRoutes.TOKEN,
      userinfo: OidcProviderRoutes.USERINFO,
    },
    subjectTypes: ['public'],
    cookies: {
      keys: env.json('COOKIES_KEYS'),
      long: {
        sameSite: 'lax',
        signed: true,
        path: '/',
      },
      short: {
        sameSite: 'lax',
        signed: true,
        path: '/',
      },
    },
    grant_types_supported: ['authorization_code'],
    features: {
      devInteractions: { enabled: false },
      encryption: { enabled: true },
      introspection: { enabled: true },
      jwtUserinfo: { enabled: true },
      jwtIntrospection: { enabled: true, ack: 'draft-10' },
      backchannelLogout: { enabled: false },
      revocation: { enabled: true },
      rpInitiatedLogout: { enabled: true },
      claimsParameter: { enabled: true },
      resourceIndicators: { enabled: false },
    },
    acceptQueryParamAccessTokens: true,
    ttl: {
      // default values can be found in the documentation
      // https://github.com/panva/node-oidc-provider/blob/v8.x/docs/README.md#ttl
      Grant: 12 * 60 * 60, // 12h - same as session lifetime
      Session: 12 * 60 * 60, // 12h - same as session lifetime
      // eslint-disable-next-line complexity
      RefreshToken: function RefreshTokenTTL(ctx, token, client) {
        if (
          ctx &&
          ctx.oidc.entities.RotatedRefreshToken &&
          client.applicationType === 'web' &&
          client.clientAuthMethod === 'none' &&
          !token.isSenderConstrained()
        ) {
          // Non-Sender Constrained SPA RefreshTokens do not have infinite expiration through rotation
          return ctx.oidc.entities.RotatedRefreshToken.remainingTTL;
        }

        return 12 * 60 * 60; // 12h - same as session lifetime
      },
    },
    acrValues: [
      'eidas1',
      'eidas2',
      'eidas3',
      'https://proconnect.gouv.fr/assurance/self-asserted',
      'https://proconnect.gouv.fr/assurance/self-asserted-2fa',
      'https://proconnect.gouv.fr/assurance/consistency-checked',
      'https://proconnect.gouv.fr/assurance/consistency-checked-2fa',
      'https://proconnect.gouv.fr/assurance/certification-dirigeant',
    ],
    scopes: ['openid'],
    issueRefreshToken: () => true,
    claims: {
      amr: ['amr'],
      uid: ['uid'],
      openid: ['sub'],
      given_name: ['given_name'],
      email: ['email'],
      phone: ['phone_number'],
      organizational_unit: ['organizational_unit'],
      siren: ['siren'],
      siret: ['siret'],
      usual_name: ['usual_name'],
      belonging_population: ['belonging_population'],
      chorusdt: ['chorusdt:matricule', 'chorusdt:societe'],
      idp_id: ['idp_id'],
      idp_acr: ['idp_acr'],
      // MonComptePro claims naming convention
      is_service_public: ['is_service_public'],
      groups: ['groups'],
      custom: ['custom'],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      lasuite_visio: ['lasuite_visio'],
      'lasuite_visio:rooms:create': ['lasuite_visio:rooms:create'],
      'lasuite_visio:rooms:list': ['lasuite_visio:rooms:list'],
      'lasuite_visio:rooms:retrieve': ['lasuite_visio:rooms:retrieve'],
      'lasuite_visio:rooms:update': ['lasuite_visio:rooms:update'],
      'lasuite_visio:rooms:delete': ['lasuite_visio:rooms:delete'],
    },
    clientDefaults: {
      grant_types: ['authorization_code', 'refresh_token'],
      id_token_signed_response_alg: 'ES256',
      response_types: ['code'],
      token_endpoint_auth_method: 'client_secret_post',
      application_type: 'web',
    },
    responseTypes: ['code'],
    revocationEndpointAuthMethods: ['client_secret_post', 'private_key_jwt'],
    tokenEndpointAuthMethods: ['client_secret_post', 'private_key_jwt'],
    enabledJWA: {
      authorizationEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
      authorizationEncryptionEncValues: ['A256GCM'],
      authorizationSigningAlgValues: ['ES256', 'RS256', 'HS256'],
      dPoPSigningAlgValues: ['ES256', 'RS256'],
      idTokenEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
      idTokenEncryptionEncValues: ['A256GCM'],
      idTokenSigningAlgValues: ['ES256', 'RS256', 'HS256'],
      introspectionEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
      introspectionEncryptionEncValues: ['A256GCM'],
      introspectionEndpointAuthSigningAlgValues: ['ES256', 'RS256'],
      introspectionSigningAlgValues: ['ES256', 'RS256', 'HS256'],
      requestObjectEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
      requestObjectEncryptionEncValues: ['A256GCM'],
      requestObjectSigningAlgValues: ['ES256', 'RS256', 'HS256'],
      revocationEndpointAuthSigningAlgValues: ['ES256', 'RS256'],
      tokenEndpointAuthSigningAlgValues: ['ES256', 'RS256'],
      userinfoEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
      userinfoEncryptionEncValues: ['A256GCM'],
      userinfoSigningAlgValues: ['ES256', 'RS256', 'HS256'],
    },
    extraParams: ['idp_hint'],
    jwks: {
      keys: [
        ...env.json('CRYPTO_SIG_ES256_PRIV_KEYS'),
        ...env.json('CRYPTO_SIG_RS256_PRIV_KEYS'),
      ],
    },
    // Global request timeout used for any outgoing app requests.
    timeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
  },
  errorUriBase: env.string('ERROR_URI_BASE'),
} as OidcProviderConfig;
