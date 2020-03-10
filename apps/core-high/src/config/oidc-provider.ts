import { OidcProviderConfig } from '@fc/oidc-provider';

export default {
  issuer:
    process.env.ISSUER_URL,
  configuration: {
    routes: {
      authorization: '/api/v2/authorize',
      interaction: '/interaction',
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
      end_session: '/user/session/end',
      revocation: '/user/token/revocation',
      token: '/api/v2/token',
      userinfo: '/api/v2/userinfo',
    },
    cookies: {
      keys: ['foo'],
    },
    // node-oidc-provider defined key
    // eslint-disable-next-line @typescript-eslint/camelcase
    grant_types_supported: ['authorization_code'],
    features: {
      introspection: { enabled: true },
      revocation: { enabled: true },
      devInteractions: { enabled: false },
    },
  },
} as OidcProviderConfig;
