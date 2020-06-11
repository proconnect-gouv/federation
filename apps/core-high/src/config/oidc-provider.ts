/* istanbul ignore file */

// Tested by DTO
import {
  OidcProviderConfig,
  OidcProviderRoutes,
  OidcProviderPrompt,
} from '@fc/oidc-provider';

export default {
  reloadConfigDelayInMs: 60 * 1000, // 1 minute
  forcedPrompt: [OidcProviderPrompt.LOGIN, OidcProviderPrompt.CONSENT],
  prefix: process.env.PREFIX,
  issuer: `https://${process.env.FQDN}${process.env.PREFIX}`,
  configuration: {
    routes: {
      authorization: OidcProviderRoutes.AUTHORIZATION,
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      check_session: OidcProviderRoutes.CHECK_SESSION,
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      code_verification: OidcProviderRoutes.CODE_VERIFICATION,
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      device_authorization: OidcProviderRoutes.DEVICE_AUTHORIZATION,
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      end_session: OidcProviderRoutes.END_SESSION,
      introspection: OidcProviderRoutes.INTROSPECTION,
      jwks: OidcProviderRoutes.JWKS,
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      pushed_authorization_request:
        OidcProviderRoutes.PUSHED_AUTHORIZATION_REQUEST,
      registration: OidcProviderRoutes.REGISTRATION,
      revocation: OidcProviderRoutes.REVOCATION,
      token: OidcProviderRoutes.TOKEN,
      userinfo: OidcProviderRoutes.USERINFO,
    },
    cookies: {
      keys: JSON.parse(process.env.OIDC_PROVIDER_COOKIES_KEYS),
      long: {
        maxAge: 600000, // 10 minutes
        sameSite: 'strict',
        signed: true,
        path: '/',
      },
      short: {
        maxAge: 600000, // 10 minutes
        sameSite: 'strict',
        signed: true,
        path: '/',
      },
    },
    // node-oidc-provider defined key
    // eslint-disable-next-line @typescript-eslint/naming-convention
    grant_types_supported: ['authorization_code'],
    features: {
      devInteractions: { enabled: false },
      encryption: { enabled: true },
      jwtUserinfo: { enabled: true },
      backchannelLogout: { enabled: true },
    },
    acceptQueryParamAccessTokens: true,
    ttl: {
      AccessToken: 60, // 1 minute
      AuthorizationCode: 30, // 30 seconds
      IdToken: 60, // 1 minute
    },
    acrValues: ['eidas1', 'eidas2', 'eidas3'],
    claims: {
      openid: ['sub'],
      gender: ['gender'],
      birthdate: ['birthdate'],
      birthcountry: ['birthcountry'],
      birthplace: ['birthplace'],
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      given_name: ['given_name'],
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      family_name: ['family_name'],
      email: ['email'],
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      preferred_username: ['preferred_username'],
      address: ['address'],
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      phone_number: ['phone_number'],
      profile: [
        'sub',
        'given_name',
        'family_name',
        'birthdate',
        'gender',
        'birthplace',
        'birthcountry',
        'preferred_username',
      ],
    },
    clientDefaults: {
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      grant_types: ['authorization_code'],
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      id_token_signed_response_alg: 'ES256',
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      response_types: ['code'],
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      token_endpoint_auth_method: 'client_secret_post',
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/naming-convention
      application_type: 'web',
    },
    responseTypes: ['code'],
    whitelistedJWA: {
      authorizationEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
      authorizationEncryptionEncValues: ['A256GCM'],
      authorizationSigningAlgValues: ['ES256'],
      dPoPSigningAlgValues: ['ES256'],
      idTokenEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
      idTokenEncryptionEncValues: ['A256GCM'],
      idTokenSigningAlgValues: ['ES256'],
      introspectionEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
      introspectionEncryptionEncValues: ['A256GCM'],
      introspectionEndpointAuthSigningAlgValues: ['ES256'],
      introspectionSigningAlgValues: ['ES256'],
      requestObjectEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
      requestObjectEncryptionEncValues: ['A256GCM'],
      requestObjectSigningAlgValues: ['ES256'],
      revocationEndpointAuthSigningAlgValues: ['ES256'],
      tokenEndpointAuthSigningAlgValues: ['ES256'],
      userinfoEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
      userinfoEncryptionEncValues: ['A256GCM'],
      userinfoSigningAlgValues: ['ES256'],
    },
    jwks: {
      keys: [JSON.parse(process.env.CRYPTO_SIG_FAKE_PRIV_KEY)],
    },
  },
} as OidcProviderConfig;
