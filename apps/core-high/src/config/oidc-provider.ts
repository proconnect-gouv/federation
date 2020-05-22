import { OidcProviderConfig } from '@fc/oidc-provider';

export default {
  reloadConfigDelayInMs: 60 * 1000, // 1 minute
  prefix: process.env.PREFIX,
  issuer: `https://${process.env.FQDN}${process.env.PREFIX}`,
  configuration: {
    routes: {
      authorization: '/authorize',
      token: '/token',
      userinfo: '/userinfo',
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
      end_session: '/logout',
      revocation: '/token/revocation',
      jwks: '/jwks',
    },
    cookies: {
      keys: JSON.parse(process.env.OIDC_PROVIDER_COOKIES_KEYS),
      long: {
        maxAge: 600000, // 10 minutes
        sameSite: 'strict',
        signed: true,
      },
      short: {
        maxAge: 600000, // 10 minutes
        sameSite: 'strict',
        signed: true,
      },
    },
    // node-oidc-provider defined key
    // eslint-disable-next-line @typescript-eslint/camelcase
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
      // eslint-disable-next-line @typescript-eslint/camelcase
      given_name: ['given_name'],
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
      family_name: ['family_name'],
      email: ['email'],
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
      preferred_username: ['preferred_username'],
      address: ['address'],
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
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
      // eslint-disable-next-line @typescript-eslint/camelcase
      grant_types: ['authorization_code'],
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
      id_token_signed_response_alg: 'ES256',
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
      response_types: ['code'],
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
      token_endpoint_auth_method: 'client_secret_post',
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
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
  sigHsmPubKey: JSON.parse(process.env.CRYPTO_SIG_HSM_PUB_KEY),
} as OidcProviderConfig;
