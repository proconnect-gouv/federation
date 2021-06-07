import {
  addFCBasicAuthorization,
  clearAllCookies,
  disableSameSiteLax,
  isUsingFCBasicAuthorization,
} from '../helpers';

beforeEach(function () {
  // Load environment config and test data
  const testEnv = Cypress.env('TEST_ENV');
  cy.fixture(`environment-${testEnv}.json`).as('env');
  cy.fixture(`service-providers-${testEnv}.json`).as('serviceProviders');
  cy.fixture(`identity-providers-${testEnv}.json`).as('identityProviders');
  cy.fixture(`users-${testEnv}.json`).as('users');
  cy.fixture(`scopes.json`).as('scopes');

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
