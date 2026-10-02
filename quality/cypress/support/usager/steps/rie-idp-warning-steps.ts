import { When } from "@badeball/cypress-cucumber-preprocessor";

When(
  "la page d'avertissement d'utilisation du hybridge s'affiche pour le fournisseur d'identité {string}",
  function (idpName: string) {
    cy.contains(
      `Le Fournisseur d'Identité "${idpName}" n'est accessible que depuis le RIE.`,
    ).should("be.visible");
  },
);
