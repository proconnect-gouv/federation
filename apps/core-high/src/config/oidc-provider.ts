import { OidcProviderConfig } from '@fc/oidc-provider';

const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = 3600;
const DAY_IN_SECONDS = 86400;

export default {
  reloadConfigDelayInMs: 60000,
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
      AccessToken: 1 * HOUR_IN_SECONDS, // 1 hour in seconds
      AuthorizationCode: 10 * MINUTE_IN_SECONDS, // 10 minutes in seconds
      IdToken: 1 * HOUR_IN_SECONDS, // 1 hour in seconds
      DeviceCode: 10 * MINUTE_IN_SECONDS, // 10 minutes in seconds
      RefreshToken: 1 * DAY_IN_SECONDS, // 1 day in seconds
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
