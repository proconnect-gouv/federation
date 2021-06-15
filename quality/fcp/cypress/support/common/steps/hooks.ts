import {
  addFCBasicAuthorization,
  clearAllCookies,
  disableSameSiteLax,
  isUsingFCBasicAuthorization,
} from '../helpers';

const setFixtureContext = (
  fixture: string,
  pathArray: string[],
  contextName: string,
): void => {
  cy.task('getFixturePath', { fixture, pathArray }).then(
    (fixturePath: string) => {
      cy.log(fixturePath);
      cy.fixture(fixturePath).as(contextName);
    },
  );
};

beforeEach(function () {
  // Load environment config and test data
  const platform: string = Cypress.env('PLATFORM');
  const testEnv: string = Cypress.env('TEST_ENV');
  const pathArray = [platform, testEnv];
  setFixtureContext('environment.json', pathArray, 'env');
  setFixtureContext('service-providers.json', pathArray, 'serviceProviders');
  setFixtureContext('identity-providers.json', pathArray, 'identityProviders');
  setFixtureContext('scopes.json', pathArray, 'scopes');
  setFixtureContext('users.json', pathArray, 'users');

  // Setup interceptions to add basic authorization header on FC requests
  if (isUsingFCBasicAuthorization()) {
    addFCBasicAuthorization();
  }

  if (testEnv === 'integ01') {
    // Avoid cookies side-effect by clearing cookies on all domains
    clearAllCookies();

    // Setup interceptions to override set-cookie samesite values
    const crossDomains = {
      FC: 'dev-franceconnect.fr',
      FI: 'fournisseur-d-identite.fr',
      FS: 'fournisseur-de-service.fr',
    };
    disableSameSiteLax(crossDomains);
  }
});

/**
 * @todo Need refactor to handle increasing number of context variables
 * author: Nicolas
 * date: 18/05/2021
 */
afterEach(function () {
  // Delete the Context variable changed during the scenario
  delete this.supportedScopeType;
  delete this.requestedScope;
  delete this.serviceProvider;
  delete this.identityProvider;
  delete this.user;
});
