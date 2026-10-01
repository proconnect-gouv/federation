import { defineConfig } from "cypress";
import path from "path";
import pluginConfig from "./cypress/plugins";

const REPOSITORY_ROOT = path.resolve(import.meta.dirname, "..");

export default defineConfig({
  chromeWebSecurity: false,
  e2e: {
    baseUrl: "https://admin-local.proconnect.127.0.0.1.nip.io",
    excludeSpecPattern: "cypress/integration/**/*.utils.js",
    experimentalRunAllSpecs: true,
    retries: 2,
    setupNodeEvents(on, config) {
      return pluginConfig(on, config);
    },
    specPattern: "cypress/integration/**/*.js",
    supportFile: "cypress/support/index.js",
    video: false,
  },
  env: {
    APP_FORBIDDEN_PAGE:
      "https://admin-local.proconnect.127.0.0.1.nip.io/service-provider",
    APP_HOME_ROLE_ADMIN:
      "https://admin-local.proconnect.127.0.0.1.nip.io/account",
    APP_HOME_ROLE_OPERATOR:
      "https://admin-local.proconnect.127.0.0.1.nip.io/service-provider",
    APP_HOME_ROLE_SECURITY:
      "https://admin-local.proconnect.127.0.0.1.nip.io/service-provider",
    APP_NAME: "admin",
    FEDERATION_DIR: REPOSITORY_ROOT,
    LOG_FILE_PATH: `${REPOSITORY_ROOT}/docker/volumes/log/fcexploitation.log`,
  },
  pageLoadTimeout: 30000,
  viewportHeight: 1800,
  viewportWidth: 1400,
});
