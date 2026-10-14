import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";
import { getEnv, getServiceProviderByDescription } from "../../common/helpers";

const RIE_IDP_NAME = "fia-rie-low";
const REVIEW_PAGE_TITLE = "Session actives de Cross Device Authentication";

const loginOnRieIdp = (email: string): void => {
  const serviceProvider = getServiceProviderByDescription("par défaut");
  cy.visit(serviceProvider.url);
  cy.get("button#custom-connection").click({ force: true });
  cy.get("#email-input").clearThenType(email);
  cy.get('[data-testid="interaction-connection-button"]').click();
  cy.contains(
    `Le Fournisseur d'Identité "${RIE_IDP_NAME}" n'est accessible que depuis le RIE.`,
  ).should("be.visible");
  cy.contains("button", "Continuer sur cet appareil").click();
  cy.get("button[type='submit']").click();
  cy.contains("Information utilisateur");
};

const validateActiveSession = (): void => {
  const { federationRootUrl } = getEnv();
  cy.request(`${federationRootUrl}/api/v2/cross-device-authentication-requests`)
    .its("body")
    .should("contain", REVIEW_PAGE_TITLE);
};

type Browser = "RIE" | "internet";

// cy.session() refuses to reuse an id with different setup/validate functions,
// so switching back to a browser must replay the functions it was created with.
const browserSessions: Partial<
  Record<Browser, { setup: () => void; options?: Cypress.SessionOptions }>
> = {};

const useBrowser = (browser: Browser): void => {
  const { setup, options } = browserSessions[browser] ?? {
    setup: () => {},
  };
  cy.session(["navigateur", browser], setup, options);
};

Given(
  "j'ai une session active sur le FI RIE avec l'email {string} sur le navigateur RIE",
  function (email: string) {
    browserSessions["RIE"] = {
      setup: () => loginOnRieIdp(email),
      options: { validate: validateActiveSession },
    };
    useBrowser("RIE");
  },
);

When("j'utilise le navigateur {string}", function (browser: Browser) {
  useBrowser(browser);
});

When("je clique sur le bouton {string}", function (buttonText: string) {
  cy.contains("button", buttonText).click();
});

Then("le bouton {string} n'est pas affiché", function (buttonText: string) {
  cy.contains("button", buttonText).should("not.exist");
});

Then(
  "je suis redirigé vers la page d'authentification cross-device",
  function () {
    cy.url().should("include", "/proceed-to-cross-device-authentication");
    cy.contains("h1", "Cross Device Authentication").should("be.visible");
  },
);

Then("je vois une seule demande d'authentification cross-device", function () {
  cy.contains("h1", REVIEW_PAGE_TITLE).should("be.visible");
  cy.get("main ul li").should("have.length", 1);
});
