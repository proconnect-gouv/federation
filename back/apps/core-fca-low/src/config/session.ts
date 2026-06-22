import { ConfigParser } from "@fc/config";
import { CoreFcaSession, Routes } from "@fc/core";
import { OidcProviderRoutes } from "@fc/oidc-provider";
import { CookieOptions, SessionConfig } from "@fc/session";

const env = new ConfigParser(process.env, "Session");

const cookieOptions: CookieOptions = {
  signed: true,
  sameSite: "lax",
  httpOnly: true,
  secure: true,
};

const sessionConfig: SessionConfig = {
  encryptionKey: env.string("USERINFO_CRYPT_KEY"),
  prefix: "FCA-LOW-SESS:",
  cookieOptions,
  cookieSecrets: env.json("COOKIE_SECRETS"),
  sessionCookieName: "pc_session_id",
  lifetime: 12 * 60 * 60, // 12h
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
    Routes.INTERACTION_ERROR,
    OidcProviderRoutes.REDIRECT_TO_SP,
    Routes.IDENTITY_PROVIDER_SELECTION,

    // Disconnect flow
    `${OidcProviderRoutes.END_SESSION}$`,
    Routes.OIDC_LOGOUT_CALLBACK,
  ],
  templateExposed: {
    User: { spName: true, idpName: true },
  },
  schema: CoreFcaSession,
};

export default sessionConfig;
