import path from "path";

const REPOSITORY_ROOT = path.resolve(__dirname, "..");

const config: Partial<Cypress.ResolvedConfigOptions<never>> = {
  chromeWebSecurity: false,
  video: false,
  e2e: {
    specPattern: "cypress/integration/**/*.feature",
    supportFile: "cypress/support/index.ts",
    experimentalRunAllSpecs: true,
  },
  expose: {
    MAILDEV_PROTOCOL: "https",
    MAILDEV_HOST: "maildev-local.proconnect.127.0.0.1.nip.io",
    MAILDEV_SMTP_PORT: "1025",
    MAILDEV_API_PORT: "443",
  },
  env: {
    // Base Configuration
    TEST_ENV: "docker",
    TAGS: "not @ignore",
    // Test environment access
    EXPLOIT_ADMIN_NAME: "jean_moust",
    EXPLOIT_ADMIN_PASS: "georgesmoustaki",
    EXPLOIT_ADMIN_TOTP: "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD",
    EXPLOIT_USER_NAME: "jean_patoche",
    EXPLOIT_USER_PASS: "georgesmoustaki",
    EXPLOIT_USER_TOTP: "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD",
    ADMIN_SECURITY_USERNAME: "jack",
    ADMIN_SECURITY_PASSWORD: "georgesmoustaki",
    ADMIN_SECURITY_TOTP_SECRET: "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD",
    FC_ACCESS_USER: "",
    FC_ACCESS_PASS: "",
    // Other Configuration
    LOG_CONTAINER_NAME: "pc-core-1",
    FEDERATION_DIR: REPOSITORY_ROOT,
  },
};

export default config;
