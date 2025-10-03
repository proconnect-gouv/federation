import { After, Before } from '@badeball/cypress-cucumber-preprocessor';

import {
  addFCBasicAuthorization,
  clearBusinessLog,
  forceSameSiteNone,
  isUsingFCBasicAuthorization,
} from '../helpers';
import { Environment } from '../types';

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

Before(function () {
  // Load environment config and test data
  const testEnv: string = Cypress.env('TEST_ENV');
  const pathArray = ['fca-low', testEnv];
  setFixtureContext('environment.json', pathArray, 'env');
  setFixtureContext('api-common.json', pathArray, 'apiRequests');

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
  if (['docker', 'recette'].includes(Cypress.env('TEST_ENV'))) {
    this.skip();
  }
});

Before({ tags: '@ignoreInteg01' }, function () {
  if (['kube-mvp0', 'integ01'].includes(Cypress.env('TEST_ENV'))) {
    this.skip();
  }
});

Before({ tags: '@validationVisuelle' }, function () {
  // Clear the localstorage before each visual test
  // @link: https://github.com/cypress-io/cypress/issues/2573
  cy.get<Environment>('@env').then((env) => {
    cy.visit(env.federationRootUrl, { failOnStatusCode: false }).then((win) => {
      win.localStorage.clear();
    });
  });
});
