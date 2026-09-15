import { ConfigParser } from "#libs/config";
import { OidcProviderRoutes } from "#libs/oidc-provider";
import { CookieOptions, SessionConfig } from "#libs/session";
import { CoreFcaSession, Routes } from "#src";
import { RequestMethod } from "@nestjs/common";

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
    // Plain paths match as prefixes, a method makes the match exact
    { path: Routes.INTERACTION, method: RequestMethod.GET },
    Routes.REDIRECT_TO_IDP,
    Routes.OIDC_CALLBACK,
    Routes.INTERACTION_VERIFY,
    Routes.INTERACTION_ERROR,
    OidcProviderRoutes.REDIRECT_TO_SP,
    Routes.RIE_IDP_WARNING,
    Routes.PROCEED_TO_CROSS_DEVICE_AUTHENTICATION,
    Routes.PROCEED_TO_IDP,
    Routes.IDENTITY_PROVIDER_SELECTION,
    Routes.VERIFY_EMAIL,
    Routes.REVIEW_CROSS_DEVICE_AUTHENTICATION_REQUESTS,

    // Disconnect flow
    // Exact match, otherwise /session/end/confirm would recreate the session
    // cookie right after logout
    { path: OidcProviderRoutes.END_SESSION, method: RequestMethod.GET },
    Routes.OIDC_LOGOUT_CALLBACK,
  ],
  templateExposed: {
    User: { spName: true, idpName: true },
  },
  schema: CoreFcaSession,
};

export default sessionConfig;
