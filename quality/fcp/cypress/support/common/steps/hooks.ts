beforeEach(() => {
  // Load environment config and test data
  const testEnv = Cypress.env('TEST_ENV');
  cy.fixture(`environment-${testEnv}.json`).as('env');
  cy.fixture(`service-providers-${testEnv}.json`).as('serviceProviders');
  cy.fixture(`identity-providers-${testEnv}.json`).as('identityProviders');
  cy.fixture(`users-${testEnv}.json`).as('users');
  cy.fixture(`scopes.json`).as('scopes');
});
