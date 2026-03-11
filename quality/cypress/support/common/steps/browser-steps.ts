import { When } from "@badeball/cypress-cucumber-preprocessor";

When(/^je rafraîchis la page$/, function () {
  cy.reload();
  // Wait for the page to load
  cy.wait(500);
});

When("je reviens en arrière", () => cy.go("back"));
