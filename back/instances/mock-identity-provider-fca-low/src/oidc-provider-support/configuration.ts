import policy from '../oidc-provider-support/policy';
import { findUserById } from '../user-data';

const {
  ServiceProviderAdapterEnv_CLIENT_ID: client_id,
  ServiceProviderAdapterEnv_CLIENT_SECRET: client_secret,
  ServiceProviderAdapterEnv_REDIRECT_URIS: stringifiedRedirectUris,
  ServiceProviderAdapterEnv_POST_LOGOUT_REDIRECT_URIS:
    stringifiedPostLogoutRedirectUris,
  ServiceProviderAdapterEnv_SCOPE: scope,
  ServiceProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG:
    id_token_signed_response_alg,
  ServiceProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG:
    userinfo_signed_response_alg,
} = process.env;

export default {
  acrValues: ['eidas1', 'eidas2', 'eidas3'],
  claims: {
    amr: null,
    // standard claims
    address: ['address'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    profile: [
      'birthdate',
      'family_name',
      'gender',
      'given_name',
      'locale',
      'middle_name',
      'name',
      'nickname',
      'picture',
      'preferred_username',
      'profile',
      'updated_at',
      'website',
      'zoneinfo',
    ],
    openid: ['sub'],
    // ProConnect claims
    siret: ['siret'],
    // Deprecated ProConnect claims
    belonging_population: ['belonging_population'],
    chorusdt: ['chorusdt:matricule', 'chorusdt:societe'],
    given_name: ['given_name'],
    organizational_unit: ['organizational_unit'],
    siren: ['siren'],
    uid: ['uid'],
    usual_name: ['usual_name'],
    is_service_public: ['is_service_public'],
  },
  clients: [
    {
      client_id,
      client_secret,
      redirect_uris: JSON.parse(stringifiedRedirectUris),
      post_logout_redirect_uris: JSON.parse(stringifiedPostLogoutRedirectUris),
      scope,
      id_token_signed_response_alg,
      userinfo_signed_response_alg,
      token_endpoint_auth_method: 'client_secret_basic',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    },
  ],
  cookies: {
    keys: [
      'some secret key',
      'and also the old rotated away some time ago',
      'and one more',
    ],
  },
  enabledJWA: {
    idTokenSigningAlgValues: ['HS256', 'ES256', 'RS256'],
    userinfoSigningAlgValues: ['HS256', 'ES256', 'RS256'],
  },
  extraParams: ['sp_id', 'sp_name'],
  features: {
    claimsParameter: { enabled: true },
    jwtUserinfo: { enabled: true },
    devInteractions: { enabled: false }, // defaults to true
    revocation: { enabled: true }, // defaults to false
    rpInitiatedLogout: {
      enabled: true,
      // disable logout confirmation screen
      logoutSource: (ctx, form) => {
        const csrfToken = /name="xsrf" value="([a-f0-9]*)"/.exec(form)![1];

        ctx.type = 'html';
        ctx.body = `
        <body onload="setTimeout(function() { document.forms[0].submit() }, 0)">
        <form action="/session/end/confirm" method="post" hidden>
          <input type="hidden" name="logout" value="non-empty-value" />
          <input type="hidden" name="xsrf" value="${csrfToken}" />
        </form>
        </body>
        `;
      },
    },
  },
  findAccount: (_ctx, id) => {
    const user = findUserById(id);

    return {
      accountId: id,
      claims: () => user,
    };
  },
  interactions: {
    url(_ctx, interaction) {
      return `/interaction/${interaction.uid}`;
    },
    policy,
  },
  jwks: {
    keys: [
      {
        d: 'VEZOsY07JTFzGTqv6cC2Y32vsfChind2I_TTuvV225_-0zrSej3XLRg8iE_u0-3GSgiGi4WImmTwmEgLo4Qp3uEcxCYbt4NMJC7fwT2i3dfRZjtZ4yJwFl0SIj8TgfQ8ptwZbFZUlcHGXZIr4nL8GXyQT0CK8wy4COfmymHrrUoyfZA154ql_OsoiupSUCRcKVvZj2JHL2KILsq_sh_l7g2dqAN8D7jYfJ58MkqlknBMa2-zi5I0-1JUOwztVNml_zGrp27UbEU60RqV3GHjoqwI6m01U7K0a8Q_SQAKYGqgepbAYOA-P4_TLl5KC4-WWBZu_rVfwgSENwWNEhw8oQ',
        dp: 'E1Y-SN4bQqX7kP-bNgZ_gEv-pixJ5F_EGocHKfS56jtzRqQdTurrk4jIVpI-ZITA88lWAHxjD-OaoJUh9Jupd_lwD5Si80PyVxOMI2xaGQiF0lbKJfD38Sh8frRpgelZVaK_gm834B6SLfxKdNsP04DsJqGKktODF_fZeaGFPH0',
        dq: 'F90JPxevQYOlAgEH0TUt1-3_hyxY6cfPRU2HQBaahyWrtCWpaOzenKZnvGFZdg-BuLVKjCchq3G_70OLE-XDP_ol0UTJmDTT-WyuJQdEMpt_WFF9yJGoeIu8yohfeLatU-67ukjghJ0s9CBzNE_LrGEV6Cup3FXywpSYZAV3iqc',
        e: 'AQAB',
        kty: 'RSA',
        n: 'xwQ72P9z9OYshiQ-ntDYaPnnfwG6u9JAdLMZ5o0dmjlcyrvwQRdoFIKPnO65Q8mh6F_LDSxjxa2Yzo_wdjhbPZLjfUJXgCzm54cClXzT5twzo7lzoAfaJlkTsoZc2HFWqmcri0BuzmTFLZx2Q7wYBm0pXHmQKF0V-C1O6NWfd4mfBhbM-I1tHYSpAMgarSm22WDMDx-WWI7TEzy2QhaBVaENW9BKaKkJklocAZCxk18WhR0fckIGiWiSM5FcU1PY2jfGsTmX505Ub7P5Dz75Ygqrutd5tFrcqyPAtPTFDk8X1InxkkUwpP3nFU5o50DGhwQolGYKPGtQ-ZtmbOfcWQ',
        p: '5wC6nY6Ev5FqcLPCqn9fC6R9KUuBej6NaAVOKW7GXiOJAq2WrileGKfMc9kIny20zW3uWkRLm-O-3Yzze1zFpxmqvsvCxZ5ERVZ6leiNXSu3tez71ZZwp0O9gys4knjrI-9w46l_vFuRtjL6XEeFfHEZFaNJpz-lcnb3w0okrbM',
        q: '3I1qeEDslZFB8iNfpKAdWtz_Wzm6-jayT_V6aIvhvMj5mnU-Xpj75zLPQSGa9wunMlOoZW9w1wDO1FVuDhwzeOJaTm-Ds0MezeC4U6nVGyyDHb4CUA3ml2tzt4yLrqGYMT7XbADSvuWYADHw79OFjEi4T3s3tJymhaBvy1ulv8M',
        qi: 'wSbXte9PcPtr788e713KHQ4waE26CzoXx-JNOgN0iqJMN6C4_XJEX-cSvCZDf4rh7xpXN6SGLVd5ibIyDJi7bbi5EQ5AXjazPbLBjRthcGXsIuZ3AtQyR0CEWNSdM7EyM5TRdyZQ9kftfz9nI03guW3iKKASETqX2vh0Z8XRjyU',
        use: 'sig',
      },
      {
        crv: 'P-256',
        d: 'K9xfPv773dZR22TVUB80xouzdF7qCg5cWjPjkHyv7Ws',
        kty: 'EC',
        use: 'sig',
        x: 'FWZ9rSkLt6Dx9E3pxLybhdM6xgR5obGsj5_pqmnz5J4',
        y: '_n8G69C-A2Xl4xUW2lF0i8ZGZnk_KPYrhv4GbTGu5G4',
      },
    ],
  },
  // eslint-disable-next-line complexity
  loadExistingGrant: async (ctx) => {
    // We want to skip the consent
    // inspired from https://github.com/panva/node-oidc-provider/blob/main/recipes/skip_consent.md
    // We updated the function to ensure it always return a grant.
    // As a consequence, the consent prompt should never be requested afterward.

    // The grant id never comes from consent results, so we simplified this line
    if (!ctx.oidc.session || !ctx.oidc.client || !ctx.oidc.params) {
      return undefined;
    }
    const oidcContextParams = ctx.oidc.params;
    const grantId = ctx.oidc.session.grantIdFor(ctx.oidc.client.clientId);

    let grant;

    if (grantId) {
      grant = await ctx.oidc.provider.Grant.find(grantId);
      // if the grant has expired, the grant can be undefined at this point.
      if (grant) {
        // Keep grant expiry aligned with session expiry to prevent consent
        // prompt being requested when the grant is about to expire.
        // The original code is overkill as session length is extended on every
        // interaction.

        const sessionTtlInSeconds = 14 * 24 * 60 * 60;
        grant.exp = Math.floor(Date.now() / 1000) + sessionTtlInSeconds;
        await grant.save();
      }
    }

    if (!grant) {
      grant = new ctx.oidc.provider.Grant({
        clientId: ctx.oidc.client.clientId,
        accountId: ctx.oidc.session.accountId,
      });
    }

    // event existing grant should be updated, as requested scopes might
    // be different
    grant.addOIDCScope(oidcContextParams.scope);
    grant.addOIDCClaims(Array.from(ctx.oidc.requestParamClaims || []));
    await grant.save();
    return grant;
  },
  pkce: { required: () => false },
};
