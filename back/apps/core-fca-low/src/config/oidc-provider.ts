import { ConfigParser } from "@fc/config";
import {
  OidcProviderConfig,
  OidcProviderPrompt,
  OidcProviderRoutes,
} from "@fc/oidc-provider";

const env = new ConfigParser(process.env, "OidcProvider");

const oidcProviderConfig: OidcProviderConfig = {
  allowedPrompt: [
    OidcProviderPrompt.LOGIN,
    OidcProviderPrompt.CONSENT,
    OidcProviderPrompt.NONE,
  ],
  cookies: {
    keys: env.json("COOKIES_KEYS"),
    long: {
      sameSite: "lax",
      signed: true,
      path: "/",
    },
    short: {
      sameSite: "lax",
      signed: true,
      path: "/",
    },
  },
  errorUriBase: env.string("ERROR_URI_BASE"),
  forcedPrompt: [OidcProviderPrompt.LOGIN],
  issuer: `https://${process.env.FQDN}${env.string("PREFIX")}`,
  jwks: {
    keys: [
      ...env.json("CRYPTO_SIG_ES256_PRIV_KEYS"),
      ...env.json("CRYPTO_SIG_RS256_PRIV_KEYS"),
    ],
  },
  prefix: env.string("PREFIX"),
  routes: {
    authorization: OidcProviderRoutes.AUTHORIZATION,
    code_verification: OidcProviderRoutes.CODE_VERIFICATION,
    device_authorization: OidcProviderRoutes.DEVICE_AUTHORIZATION,
    end_session: OidcProviderRoutes.END_SESSION,
    introspection: OidcProviderRoutes.INTROSPECTION,
    jwks: OidcProviderRoutes.JWKS,
    pushed_authorization_request:
      OidcProviderRoutes.PUSHED_AUTHORIZATION_REQUEST,
    registration: OidcProviderRoutes.REGISTRATION,
    revocation: OidcProviderRoutes.REVOCATION,
    token: OidcProviderRoutes.TOKEN,
    userinfo: OidcProviderRoutes.USERINFO,
  },
  supportedAcrValues: [
    "eidas0",
    "eidas0-mfa",
    "eidas1",
    "eidas1-mfa",
    "eidas2",
    "eidas3",
    "https://proconnect.gouv.fr/assurance/certification-dirigeant",
  ],
  // Global request timeout used for any outgoing app requests.
  timeout: parseInt(process.env.REQUEST_TIMEOUT as string, 10),
};

export default oidcProviderConfig;
