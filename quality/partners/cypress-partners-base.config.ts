// Disable sort-keys to separate base configuration and access env variables
/* eslint-disable sort-keys-fix/sort-keys-fix, sort-keys */
const config: Partial<Cypress.ResolvedConfigOptions<never>> = {
  chromeWebSecurity: false,
  video: false,
  e2e: {
    baseUrl: 'https://partners.docker.dev-franceconnect.fr',
    specPattern: 'cypress/integration/*.feature',
    supportFile: 'cypress/support/index.ts',
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
  },
  env: {
    // Base Configuration
    PLATFORM: 'partners',
    TEST_ENV: 'docker',
    TAGS: 'not @ignore',
  },
};

export default config;
