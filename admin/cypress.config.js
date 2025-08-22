const { defineConfig } = require('cypress');

const pluginConfig = require('./cypress/plugins');

module.exports = defineConfig({
  chromeWebSecurity: false,
  e2e: {
    baseUrl: 'https://exploitation-fca-low.docker.dev-franceconnect.fr',
    excludeSpecPattern: 'cypress/integration/**/*.utils.js',
    experimentalRunAllSpecs: true,
    retries: 2,
    setupNodeEvents(on, config) {
      return pluginConfig(on, config);
    },
    specPattern: 'cypress/integration/**/*.js',
    supportFile: 'cypress/support/index.js',
    video: false,
  },
  env: {
    APP_FORBIDDEN_PAGE:
    'https://exploitation-fca-low.docker.dev-franceconnect.fr/service-provider',
    APP_HOME_ROLE_ADMIN:
    'https://exploitation-fca-low.docker.dev-franceconnect.fr/account',
    APP_HOME_ROLE_OPERATOR:
    'https://exploitation-fca-low.docker.dev-franceconnect.fr/service-provider',
    APP_HOME_ROLE_SECURITY:
    'https://exploitation-fca-low.docker.dev-franceconnect.fr/service-provider',
    APP_NAME: 'admin',
    FEDERATION_DIR: `${process.env.PC_ROOT}/federation`,
    LOG_FILE_PATH: `${process.env.PC_ROOT}/federation/docker/volumes/log/fcexploitation.log`,
    TOTP_WINDOW: 'loose',
  },
  pageLoadTimeout: 30000,
  viewportHeight: 1800,
  viewportWidth: 1400
});
