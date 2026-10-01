import { CoreFcaConfig, CoreFcaSession, Routes } from "@fc/core";
import { OidcProviderRoutes } from "@fc/oidc-provider";
import { RateLimiterKeyPrefix } from "@fc/rate-limiter";

// Values mirror docker/compose/shared/.env/base-app.env +
// docker/compose/fca-low/.env/core.env (the real dev config for this
// app), minus anything only needed for HTTPS/file-backed secrets.
// Emails and secret-looking values are explicitly fake (PR review:
// copied real-looking ones raise needless suspicion). The fixture
// seeds' `client_secret` blobs are encrypted with the fake
// `clientSecretEncryptKey` below.
const TEST_CONFIG: Partial<CoreFcaConfig> = {
  App: {
    name: "CORE_FCA_LOW",
    urlPrefix: "/api/v2",
    httpsOptions: {},
    fqdn: "core-fca-low.docker.dev-franceconnect.fr",
    viewsPaths: ["../../../apps/core-fca-low/src"],
    defaultIdpId: "71144ab3-ee1a-4401-b7b3-79b44f7daeeb",
    spAuthorizedAttachedEmailDomainsConfigs: [
      {
        spId: "6495f347513b860e6b931fae4a1ba70c8489a558a0fc74ecdc094d48a4035e77",
        spName: "FSA3-LOW",
        spContact: "inquisitor@example.com",
        authorizedAttachedEmailDomains: ["fia1.fr", "fia2.fr"],
      },
    ],
    defaultEmailRenater: "test@example.com",
    contentSecurityPolicy: {
      connectSrc: [],
      defaultSrc: [],
      styleSrc: [],
      scriptSrc: [],
      frameAncestors: [],
      imgSrc: [],
    },
    defaultRedirectUri: "https://www.proconnect.gouv.fr",
    supportEmail: "support+federation@example.com",
    idpRoutingForcingEmailSuffix: "+proconnect",
    idpMfaComplianceForcingEmailSuffix: "+mfa",
    displayTestEnvWarning: false,
    displayMaintenanceNotice: false,
  },
  Exceptions: { prefix: "Y" },
  HyyyperbridgeBroker: {
    payloadEncoding: "base64",
    queue: "rie",
    queueOptions: { durable: true },
    requestTimeout: 6000,
    urls: ["amqp://fca-rie_user:fca-rie_user@172.16.6.1:5672/fca-rie"],
  },
  Logger: { threshold: "debug" },
  OidcProvider: {
    allowedPrompt: ["login", "consent", "none"],
    forcedPrompt: ["login"],
    cookies: {
      keys: [
        "CeciEstUnTokenDeTest-1",
        "CeciEstUnTokenDeTest-2",
        "CeciEstUnTokenDeTest-3",
        "CeciEstUnTokenDeTest-4",
      ],
      long: { sameSite: "lax", signed: true, path: "/" },
      short: { sameSite: "lax", signed: true, path: "/" },
    },
    errorUriBase:
      "https://github.com/numerique-gouv/proconnect-documentation/blob/main/doc_fs/troubleshooting-fs.md",
    issuer: "https://core-fca-low.docker.dev-franceconnect.fr/api/v2",
    prefix: "/api/v2",
    routes: {
      authorization: "/authorize",
      code_verification: "/device",
      device_authorization: "/device/auth",
      end_session: "/session/end",
      introspection: "/token/introspection",
      jwks: "/jwks",
      pushed_authorization_request: "/request",
      registration: "/reg",
      revocation: "/token/revocation",
      token: "/token",
      userinfo: "/userinfo",
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
    acrValuesThatRequireNewSession: ["eidas2", "eidas3"],
    timeout: 6000,
    jwks: {
      keys: [
        {
          alg: "ES256",
          crv: "P-256",
          x: "uRxO96Oqn0BEJZYua3rkM9ntzLbt_nDbq4hwSgOUomQ",
          y: "o9BoK63TMCGmXjOcCZbtOTmw5HdGiy5ZzY4Qo5KG638",
          d: "sMJDu7_nEjB0SwTKuKR8XiZPHvoUkem3rdgxP39kkfQ",
          kty: "EC",
          kid: "CeciEstUnKidDeTest",
          use: "sig",
        },
      ],
    },
  },
  OidcClient: {
    timeout: 6000,
    jwks: { keys: [] },
    postLogoutRedirectUri:
      "https://core-fca-low.docker.dev-franceconnect.fr/api/v2/client/logout-callback",
    redirectUri:
      "https://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback",
    enableHyyyperbridge: false,
  },
  Mailer: {
    transport: "smtp",
    fromEmail: "no-reply@example.com",
    fromName: "NE PAS RÉPONDRE",
    smtpUrl: "smtp://maildev:1025",
    emailSubjectPrefix: "Test - ",
  },
  RateLimiter: {
    rateLimiterParams: [
      {
        keyPrefix: RateLimiterKeyPrefix.VERIFY_EMAIL_TOKEN,
        points: 10,
        duration: 5 * 60,
      },
    ],
  },
  Session: {
    encryptionKey: "CeciEstUneCleDeChiffrementTest32",
    prefix: "FCA-LOW-SESS:",
    cookieOptions: {
      signed: true,
      sameSite: "lax",
      httpOnly: true,
      secure: true,
    },
    cookieSecrets: [
      "CeciEstUnSecret1",
      "CeciEstUnSecret2",
      "CeciEstUnSecret3",
      "CeciEstUnSecret4",
    ],
    sessionCookieName: "pc_session_id",
    lifetime: 12 * 60 * 60,
    sessionIdLength: 64,
    slidingExpiration: false,
    middlewareExcludedRoutes: [],
    // Mirrors apps/core-fca-low/src/config/session.ts's own list exactly
    // (same enums) - hand-copied strings drifted from production once
    // already (missing /session/end$, a phantom /client/disconnect-from-idp
    // that matches no real route), don't repeat that mistake.
    middlewareIncludedRoutes: [
      OidcProviderRoutes.AUTHORIZATION,
      `${Routes.INTERACTION}$`,
      Routes.REDIRECT_TO_IDP,
      Routes.OIDC_CALLBACK,
      Routes.INTERACTION_VERIFY,
      Routes.INTERACTION_ERROR,
      OidcProviderRoutes.REDIRECT_TO_SP,
      Routes.IDENTITY_PROVIDER_SELECTION,
      Routes.VERIFY_EMAIL,
      `${OidcProviderRoutes.END_SESSION}$`,
      Routes.OIDC_LOGOUT_CALLBACK,
    ],
    templateExposed: { User: { spName: true, idpName: true } },
    defaultData: { User: {}, Csrf: {}, FlowSteps: {} },
    schema: CoreFcaSession,
  },
  ServiceProviderAdapterMongo: {
    clientSecretEncryptKey: "CeciEstLaCleDesSecretsClients123",
  },
  IdentityProviderAdapterMongo: {
    clientSecretEncryptKey: "CeciEstLaCleDesSecretsClients123",
    decryptClientSecretFeature: true,
  },
} as Partial<CoreFcaConfig>;

export default TEST_CONFIG;
