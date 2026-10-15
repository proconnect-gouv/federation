import { When } from "@badeball/cypress-cucumber-preprocessor";

const RIE_IDP_WARNING_PAGE_TITLE = "Authentification hors RIE";

When(
  "la page d'avertissement d'utilisation du hybridge s'affiche",
  function () {
    cy.contains("h1", RIE_IDP_WARNING_PAGE_TITLE).should("be.visible");
  },
);
