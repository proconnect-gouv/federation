import { ConfigParser } from '@fc/config';
import { CoreFcaRoutes, CoreFcaSession } from '@fc/core-fca';
import { OidcClientRoutes } from '@fc/oidc-client';
import { OidcProviderRoutes } from '@fc/oidc-provider';
import { SessionConfig, SessionCookieOptionsInterface } from '@fc/session';

const env = new ConfigParser(process.env, 'Session');

const cookieOptions: SessionCookieOptionsInterface = {
  signed: true,
  sameSite: 'lax',
  httpOnly: true,
  secure: true,
  maxAge: 43200000, // 12h
};

export default {
  encryptionKey: env.string('USERINFO_CRYPT_KEY'),
  prefix: 'FCA-LOW-SESS:',
  cookieOptions,
  cookieSecrets: env.json('COOKIE_SECRETS'),
  sessionCookieName: 'pc_session_id',
  lifetime: 43200, // 12h
  sessionIdLength: 64,
  slidingExpiration: false,
  middlewareExcludedRoutes: [],
  middlewareIncludedRoutes: [
    // Connect flow
    OidcProviderRoutes.AUTHORIZATION,
    `${CoreFcaRoutes.INTERACTION}$`,
    OidcClientRoutes.REDIRECT_TO_IDP,
    OidcClientRoutes.OIDC_CALLBACK,
    CoreFcaRoutes.INTERACTION_VERIFY,
    OidcProviderRoutes.REDIRECT_TO_SP,
    CoreFcaRoutes.INTERACTION_IDENTITY_PROVIDER_SELECTION,

    // Disconnect flow
    OidcClientRoutes.DISCONNECT_FROM_IDP,
    OidcClientRoutes.CLIENT_LOGOUT_CALLBACK,
  ],
  templateExposed: {
    User: { spName: true, idpName: true },
  },
  schema: CoreFcaSession,
  defaultData: {
    User: {},
    Csrf: {},
    FlowSteps: {},
  },
} as SessionConfig;
