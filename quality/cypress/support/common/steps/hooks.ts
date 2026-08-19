import { After, Before } from "@badeball/cypress-cucumber-preprocessor";
import {
  addFCBasicAuthorization,
  clearBusinessLog,
  getEnv,
  isUsingFCBasicAuthorization,
} from "../helpers";

Before(function () {
  // Setup interceptions to add basic authorization header on FC requests
  if (isUsingFCBasicAuthorization()) {
    addFCBasicAuthorization();
  }

  clearBusinessLog();
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

Before({ tags: "@validationVisuelle" }, function () {
  // Clear the localstorage before each visual test
  // @link: https://github.com/cypress-io/cypress/issues/2573
  const { federationRootUrl } = getEnv();
  cy.visit(federationRootUrl, { failOnStatusCode: false }).then((win) => {
    win.localStorage.clear();
  });
});
