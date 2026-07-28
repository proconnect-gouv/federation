import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

When(
  "je rentre le code de confirmation {string} {int} fois",
  function (code: string, times: number) {
    for (let i = 0; i < times; i++) {
      cy.get('input[name="verify_email_token"]').type(code);
      cy.contains("Continuer").click();
    }
  },
);

When("la base de données est réinitialisée", function () {
  cy.resetMongo();
});

When("je rentre le code de confirmation {string}", function (code: string) {
  cy.get('input[name="verify_email_token"]').type(code);
  cy.contains("Continuer").click();
});

When("je rentre le code de confirmation reçu par e-mail", function () {
  cy.verifyEmail();
});

When("je vois un bouton {string} désactivé", function (buttonText: string) {
  cy.contains(buttonText).should("be.disabled");
});

Then("la boîte de réception contient 1 e-mail", () => {
  cy.maildevGetAllMessages().then((messages) => {
    expect(messages).to.have.length(1);
  });
});

Then("je suis redirigé vers la page de vérification de l'email", function () {
  cy.url().should("include", "/verify-email");
});

Then("je vois le message d'erreur {string}", function (message: string) {
  cy.get(".fr-alert--error").contains(message);
});
