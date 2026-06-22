import { ConfigParser } from "@fc/config";
import { OidcClientConfig } from "@fc/oidc-client";
import { Routes } from "../enums";
import app from "./app";

const env = new ConfigParser(process.env, "OidcClient");

const oidcClientConfig: OidcClientConfig = {
  // Global request timeout for all outgoing application requests.
  // This duration is in seconds and is typically set to 6000 in most environments,
  // which equals 100 minutes.
  // This value is unusually high and should be reassessed in the future.
  timeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
  // This value is not used in the current implementation.
  jwks: {
    keys: env.json("CRYPTO_ENC_LOCALE_PRIV_KEYS"),
  },
  postLogoutRedirectUri: `https://${app.fqdn}${app.urlPrefix}${Routes.OIDC_LOGOUT_CALLBACK}`,
  redirectUri: `https://${app.fqdn}${app.urlPrefix}${Routes.OIDC_CALLBACK}`,
  enableHyyyperbridge: env.boolean("FEATURE_ENABLE_HYYYPERBRIDGE"),
};

export default oidcClientConfig;
