import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

When(
  "la page d'avertissement d'utilisation du hybridge s'affiche pour le fournisseur d'identité {string}",
  function (idpName: string) {
    cy.contains(
      `Le Fournisseur d'Identité "${idpName}" n'est accessible que depuis le RIE.`,
    ).should("be.visible");
  },
);

When("je clique sur le bouton Continuer quand même", function () {
  cy.contains("button", "Continuer quand même").click();
});

When("je clique sur le bouton Continuer en Cross-Device", function () {
  this.crossDeviceAuthenticationRequestedAt = new Date().toISOString();
  cy.contains("button", "Continuer en Cross-Device").click();
});

Then(
  "je suis redirigé vers la page d'authentification cross-device",
  function () {
    cy.url().should("include", "/proceed-to-cross-device-authentication");
    cy.contains("h1", "Cross Device Authentication").should("be.visible");
  },
);

Then(
  "une demande d'authentification cross-device a été créée pour l'email {string}",
  function (email: string) {
    cy.task<number>("countCrossDeviceAuthenticationRequests", {
      email,
      status: "initiated",
      createdSince: this.crossDeviceAuthenticationRequestedAt,
    }).should("eq", 1);
  },
);
