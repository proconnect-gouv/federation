beforeEach(function () {
  // Load environment config and test data
  const testEnv = Cypress.env('TEST_ENV');
  cy.fixture(`environment-${testEnv}.json`).as('env');
  cy.fixture(`service-providers-${testEnv}.json`).as('serviceProviders');
  cy.fixture(`identity-providers-${testEnv}.json`).as('identityProviders');
  cy.fixture(`users-${testEnv}.json`).as('users');
  cy.fixture(`scopes.json`).as('scopes');
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
