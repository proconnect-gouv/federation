import { OidcProviderConfig } from '@fc/oidc-provider';

export default {
  reloadConfigDelayInMs: 60 * 1000, // 1 minute
  issuer: process.env.ISSUER_URL,
  configuration: {
    routes: {
      authorization: '/api/v2/authorize',
      interaction: '/interaction',
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
      end_session: '/api/v2/logout',
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
      devInteractions: { enabled: false },
      encryption: { enabled: true },
      jwtUserinfo: { enabled: true },
      sessionManagement: { enabled: true },
      backchannelLogout: { enabled: true },
    },
    ttl: {
      AccessToken: 60, // 1 minute
      AuthorizationCode: 30, // 30 seconds
      IdToken: 60, // 1 minute
    },
    acrValues: ['eidas1', 'eidas2', 'eidas3'],
    claims: {
      openid: ['sub'], // Identifiant technique (sub) de l'utilisateur au format OpenIDConnect
      gender: ['gender'], // Sexe
      birthdate: ['birthdate'], // Date de naissance
      birthcountry: ['birthcountry'], // Pays de naissance
      birthplace: ['birthplace'], // Ville de naissance
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
      given_name: ['given_name'], // Prénoms
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
      family_name: ['family_name'], // Nom de naissance
      email: ['email'], // Adresse électronique
      // node-oidc-provider defined key
      // eslint-disable-next-line @typescript-eslint/camelcase
      preferred_username: ['preferred_username'], // Nom d'usage (information renvoyée si disponible)
      address: ['address'], // Adresse postale (information renvoyée si disponible)
      phone: ['phone_number'], // Numéro de téléphone (information renvoyée si disponible)
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
    jwks: {
      keys: [JSON.parse(process.env.CRYPTO_SIG_FAKE_PRIV_KEY)],
    },
  },
  sigHsmPubKey: JSON.parse(process.env.CRYPTO_SIG_HSM_PUB_KEY),
} as OidcProviderConfig;
