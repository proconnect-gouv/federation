import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";
import { getEnv, getIdentityProviderByDescription } from "../../common/helpers";

Then("je suis redirigé vers la page interaction", function () {
  cy.get('[data-testid="interaction-connection-button"]').should("be.visible");
});

When("j'entre l'email {string}", function (email: string) {
  cy.get("#email-input").clearThenType(email);
});

When("je clique sur le bouton de connexion", function () {
  cy.get('[data-testid="interaction-connection-button"]').click();
});

When("je clique sur la suggestion d'email corrigé", function () {
  cy.get("a#email-suggestion-link").click();
});

Then("le champ email correspond à {string}", function (email: string) {
  cy.get("#email-input").invoke("val").should("be.equal", email);
});

Given(
  /je paramètre un intercepteur pour l'appel authorize au fournisseur d'identité "([^"]*)"/,
  function (idpDescription: string) {
    const { url } = getIdentityProviderByDescription(idpDescription);
    cy.intercept(`${url}/auth*`).as("FI:Authorize");
  },
);

Given(
  'je mets le state fourni par AC dans le paramètre "state" de la requête',
  function () {
    cy.wait("@FI:Authorize")
      .its("request.query.state")
      .should("exist")
      .then((value: string) => {
        this.apiRequest.qs["state"] = value;
      });
  },
);

Then("le bouton {string} est {string}", (buttonText, state) => {
  const assertion = state === "désactivé" ? "be.disabled" : "not.be.disabled";
  cy.contains("button", buttonText).should(assertion);
});

Then("je suis redirigé vers la page de déconnexion", function () {
  cy.contains(
    "Vous êtes bien déconnecté, vous pouvez fermer votre navigateur.",
  );
});

// Matches GET /api/v2/interaction/:uid but not /api/v2/interaction/:uid/verify
const INTERACTION_PAGE_URL = /\/api\/v2\/interaction\/[^/?]+(\?.*)?$/;

Given(
  "je paramètre un intercepteur pour ne pas afficher la page interaction",
  function () {
    // Stub the interaction page once so that the core does not refresh its
    // own session with the new interaction, as an attacker would do.
    // The oidc-provider interaction cookie is still set by /authorize.
    cy.intercept(
      { method: "GET", url: INTERACTION_PAGE_URL, times: 1 },
      (req) => req.reply(200, "interaction page skipped"),
    ).as("PCF:Interaction");
  },
);

When(
  "je navigue directement sur la page de vérification de l'interaction",
  function () {
    const { federationRootUrl } = getEnv();
    cy.wait("@PCF:Interaction")
      .its("request.url")
      .then((url: string) => {
        const { pathname } = new URL(url);
        cy.visit(`${federationRootUrl}${pathname}/verify`, {
          failOnStatusCode: false,
        });
      });
  },
);
