import { ConfigParser } from "@fc/config";
import { AppConfig } from "@fc/core";

const env = new ConfigParser(process.env, "App");

const appConfig: AppConfig = {
  name: "CORE_FCA_LOW",
  urlPrefix: "/api/v2",
  assetsPaths: env.json("ASSETS_PATHS"),
  assetsDsfrPaths: env.json("DSFR_ASSETS_PATHS"),
  assetsCacheTtl: env.number("ASSETS_CACHE_TTL", true),
  viewsPaths: env.json("VIEWS_PATHS"),
  httpsOptions: {
    key: env.file("HTTPS_SERVER_KEY", true),
    cert: env.file("HTTPS_SERVER_CERT", true),
  },
  fqdn: process.env.FQDN as string,
  defaultIdpId: env.string("DEFAULT_IDP_UID"),
  spAuthorizedFqdnsConfigs: env.json("SP_AUTHORIZED_FQDNS_CONFIGS"),
  defaultEmailRenater: env.string("DEFAULT_EMAIL_RENATER"),
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'"],
    scriptSrc: ["'self'", "stats.data.gouv.fr", "blob:"],
    connectSrc: ["'self'", "stats.data.gouv.fr"],
    frameAncestors: [],
    imgSrc: ["'self'", "data:", "stats.data.gouv.fr"],
  },
  displayTestEnvWarning: env.boolean("FEATURE_DISPLAY_TEST_ENV_WARNING", true),
  displayMaintenanceNotice: env.boolean(
    "FEATURE_DISPLAY_MAINTENANCE_NOTICE",
    true,
  ),
  maintenanceDatetime: env.string("MAINTENANCE_DATETIME"),
  maintenanceDuration: env.string("MAINTENANCE_DURATION"),
  defaultRedirectUri: "https://www.proconnect.gouv.fr",
  supportEmail: "support+federation@proconnect.gouv.fr",
  idpRoutingForcingEmailSuffix: "+proconnect",
  idpMfaComplianceForcingEmailSuffix: "+mfa",
};

export default appConfig;
