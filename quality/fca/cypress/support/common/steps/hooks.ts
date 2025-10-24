import { After, Before } from '@badeball/cypress-cucumber-preprocessor';

import {
  addFCBasicAuthorization,
  clearBusinessLog,
  forceSameSiteNone,
  getEnv,
  isUsingFCBasicAuthorization,
} from '../helpers';
import { Environment } from '../types';

Before(function () {
  // Load environment config and test data
  const testEnv: string = Cypress.env('TEST_ENV');

  // Setup interceptions to add basic authorization header on FC requests
  if (isUsingFCBasicAuthorization()) {
    addFCBasicAuthorization();
  }

  if (testEnv === 'docker') {
    clearBusinessLog();
  } else if (testEnv === 'integ01') {
    // Setup interceptions to override set-cookie samesite values
    const crossDomains = {
      AC: 'dev-agentconnect.fr',
    };
    forceSameSiteNone(crossDomains);
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
  if (['docker', 'recette'].includes(Cypress.env('TEST_ENV'))) {
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
