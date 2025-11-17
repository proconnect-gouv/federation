import { After, Before } from '@badeball/cypress-cucumber-preprocessor';

import {
  addFCBasicAuthorization,
  clearBusinessLog,
  forceSameSiteNone,
  getEnv,
  isUsingFCBasicAuthorization,
} from '../helpers';

Before(function () {
  // Load environment config and test data
  const testEnv: string = Cypress.env('TEST_ENV');

  // Setup interceptions to add basic authorization header on FC requests
  if (isUsingFCBasicAuthorization()) {
    addFCBasicAuthorization();
  }

  switch (testEnv) {
    case 'kube-mvp0':
      // Setup interceptions to override set-cookie samesite values
      forceSameSiteNone({
        AC: 'dev-agentconnect.fr',
      });
      break;
    case 'integ01':
      // Setup interceptions to override set-cookie samesite values
      forceSameSiteNone({
        AC: 'dev-agentconnect.fr',
      });
      break;
    case 'docker':
    default:
      clearBusinessLog();
  }
});

/**
 * @todo Need refactor to handle increasing number of context variables
 * author: Nicolas
 * date: 18/05/2021
 */
After(function () {
  // Delete the Context variable changed during the scenario
  delete this.operatorUser;
});

Before({ tags: '@ignoreDocker' }, function () {
  if (['docker', 'kube-mvp0'].includes(Cypress.env('TEST_ENV'))) {
    this.skip();
  }
});

Before({ tags: '@ignoreInteg01' }, function () {
  if (Cypress.env('TEST_ENV') === 'integ01') {
    this.skip();
  }
});

Before({ tags: '@validationVisuelle' }, function () {
  // Clear the localstorage before each visual test
  // @link: https://github.com/cypress-io/cypress/issues/2573
  const { federationRootUrl } = getEnv();
  cy.visit(federationRootUrl, { failOnStatusCode: false }).then((win) => {
    win.localStorage.clear();
  });
});
