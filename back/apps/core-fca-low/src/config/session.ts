import { ConfigParser } from '@fc/config';
import { CoreFcaSession, Routes } from '@fc/core';
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
    `${Routes.INTERACTION}$`,
    Routes.REDIRECT_TO_IDP,
    Routes.OIDC_CALLBACK,
    Routes.INTERACTION_VERIFY,
    OidcProviderRoutes.REDIRECT_TO_SP,
    Routes.IDENTITY_PROVIDER_SELECTION,

    // Disconnect flow
    Routes.DISCONNECT_FROM_IDP,
    Routes.CLIENT_LOGOUT_CALLBACK,
  ],
  templateExposed: {
    User: { spName: true, idpName: true },
  },
  schema: CoreFcaSession,
} as SessionConfig;
