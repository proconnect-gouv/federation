import { CoreFcaConfig, CoreFcaSession } from "@fc/core";
import { RateLimiterKeyPrefix } from "@fc/rate-limiter";

// Values mirror docker/compose/shared/.env/base-app.env +
// docker/compose/fca-low/.env/core.env (the real dev config for this
// app), minus anything only needed for HTTPS/file-backed secrets.
const TEST_CONFIG: CoreFcaConfig = {
  App: {
    name: "CORE_FCA_LOW",
    urlPrefix: "/api/v2",
    httpsOptions: {},
    fqdn: "core-fca-low.docker.dev-franceconnect.fr",
    assetsPaths: ["../../../apps/core-fca-low/src"],
    assetsDsfrPaths: [
      {
        assetPath: "../../../node_modules/@gouvfr/dsfr/dist/dsfr",
        prefix: "/dsfr",
      },
      {
        assetPath: "../../../node_modules/@gouvfr/dsfr/dist/fonts",
        prefix: "/fonts",
      },
      {
        assetPath: "../../../node_modules/@gouvfr/dsfr/dist/icons",
        prefix: "/icons",
      },
      {
        assetPath: "../../../node_modules/@gouvfr/dsfr/dist/utility/icons",
        prefix: "/utility",
      },
    ],
    assetsCacheTtl: 3600,
    viewsPaths: ["../../../apps/core-fca-low/src"],
    defaultIdpId: "71144ab3-ee1a-4401-b7b3-79b44f7daeeb",
    spAuthorizedAttachedEmailDomainsConfigs: [
      {
        spId: "6495f347513b860e6b931fae4a1ba70c8489a558a0fc74ecdc094d48a4035e77",
        spName: "FSA3-LOW",
        spContact: "serviceclient@fsa3-low.fr",
        authorizedAttachedEmailDomains: ["fia1.fr", "fia2.fr"],
      },
    ],
    defaultEmailRenater: "test@renater.agentconnect.gouv.fr",
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'", "stats.data.gouv.fr", "blob:"],
      connectSrc: ["'self'", "stats.data.gouv.fr"],
      frameAncestors: [],
      imgSrc: ["'self'", "data:", "stats.data.gouv.fr"],
    },
    defaultRedirectUri: "https://www.proconnect.gouv.fr",
    supportEmail: "support+federation@proconnect.gouv.fr",
    idpRoutingForcingEmailSuffix: "+proconnect",
    idpMfaComplianceForcingEmailSuffix: "+mfa",
    displayTestEnvWarning: false,
    displayMaintenanceNotice: false,
  },
  ApiEntreprise: {
    token: "CeciEstUnTokenDeTest",
    baseUrl: "https://entreprise.api.gouv.fr",
    shouldMockApi: true,
    featureFetchOrganizationData: true,
    organizationSiret: "13002526500013",
    cachedTTL: 86400000,
    cacheTTLWhenApiEntrepriseIsDown: 7776000000,
  },
  Exceptions: { prefix: "Y" },
  EmailValidator: {
    domainWhitelist: [],
    featureMxResolutionValidation: true,
  },
  EmailVerification: {
    isOtpEmailEnabled: true,
    tokenExpirationDurationInMs: 60 * 60 * 1000,
    verificationEmailCooldownBeforeResendInMs: 10 * 60 * 1000,
  },
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
        "iet7jaetheezaingahThooSiem3Oothu",
        "aeChoomaeyi5Jeo7Viezoh8aew8ieH3m",
        "JaeDahngohc3athooy1Eip2ahtei8Aep",
        "iu5vu5EeD4goow5eipeizequaetaxo0V",
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
          kid: "pkcs11:ES256:hsm",
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
    fromEmail: "no-reply@account.proconnect.gouv.fr",
    fromName: "NE PAS RÉPONDRE",
    smtpUrl: "smtp://maildev:1025",
    emailSubjectPrefix: "Test - ",
  },
  Mongoose: {
    // overridden per-test with the in-memory replset URI, see test-bench.ts
    user: "fc",
    password: "pass",
    hosts: "mongo:27017",
    database: "core-fca-low",
    options: {
      authSource: "core-fca-low",
      tls: false,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    },
    watcherDebounceWaitDuration: 0,
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
  Redis: {
    host: "redis-pwd",
    port: 6379,
    password: "Ivae1feiThoogahquohDei7iwie0ceeM",
    db: 4,
    sentinels: undefined,
    name: undefined,
    sentinelPassword: undefined,
    sentinelTLS: undefined,
    tls: undefined,
    enableTLSForSentinelMode: false,
  },
  Session: {
    encryptionKey: "raePh3i+a4eiwieb-H5iePh6o/gheequ",
    prefix: "FCA-LOW-SESS:",
    cookieOptions: {
      signed: true,
      sameSite: "lax",
      httpOnly: true,
      secure: true,
    },
    cookieSecrets: [
      "yahvaeJ0eiNua6te",
      "lidubozieKadee7w",
      "Eigoh6ev8xaiNoox",
      "veed7Oow7er5Saim",
    ],
    sessionCookieName: "pc_session_id",
    lifetime: 12 * 60 * 60,
    sessionIdLength: 64,
    slidingExpiration: false,
    middlewareExcludedRoutes: [],
    middlewareIncludedRoutes: [
      "/authorize",
      "/interaction/:uid$",
      "/redirect-to-idp",
      "/oidc-callback",
      "/interaction/:uid/verify",
      "/login",
      "/identity-provider-selection",
      "/client/disconnect-from-idp",
      "/client/logout-callback",
    ],
    templateExposed: { User: { spName: true, idpName: true } },
    defaultData: { User: {}, Csrf: {}, FlowSteps: {} },
    schema: CoreFcaSession,
  },
  ServiceProviderAdapterMongo: {
    clientSecretEncryptKey: "JZBlwxfKnbn/RV025aw+dQxk+xoQT+Yr",
  },
  IdentityProviderAdapterMongo: {
    clientSecretEncryptKey: "JZBlwxfKnbn/RV025aw+dQxk+xoQT+Yr",
    decryptClientSecretFeature: true,
  },
} as CoreFcaConfig;

export default TEST_CONFIG;
