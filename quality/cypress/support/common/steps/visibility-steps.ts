import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("je vois {string}", function (text: string) {
  cy.contains(text).should("be.visible");
});

Then("je ne vois pas {string}", function (text: string) {
  cy.contains(text).should("not.exist");
});
