import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";
import {
  getCookieFromUrl,
  getEnv,
  setUnknowSessionIdInSessionCookie,
} from "../helpers";

Then(
  /^le cookie "([^"]+)" est (présent|absent|supprimé)$/,
  function (cookieName: string, text: string) {
    const existNotExist = text === "présent" ? "exist" : "not.exist";
    const { federationRootUrl } = getEnv();
    getCookieFromUrl(cookieName, federationRootUrl).should(existNotExist);
  },
);

When(
  /^je mémorise la valeur du cookie "([^"]+)"$/,
  function (cookieName: string) {
    const { federationRootUrl } = getEnv();
    getCookieFromUrl(cookieName, federationRootUrl)
      .should("exist")
      .as(`cookie:${cookieName}`);
  },
);

Then(
  /^la valeur du cookie "([^"]+)" est (identique|différente)$/,
  function (cookieName: string, text: string) {
    const { federationRootUrl } = getEnv();
    const equalNotEqual = text === "identique" ? "equal" : "not.equal";
    cy.get<Cypress.Cookie>(`@cookie:${cookieName}`).then((previousCookie) => {
      expect(previousCookie).to.exist;
      const { value: previousValue } = previousCookie;

      getCookieFromUrl(cookieName, federationRootUrl)
        .should("exist")
        .its("value")
        .should(equalNotEqual, previousValue);
    });
  },
);

Given("je supprime tous les cookies", function () {
  cy.clearAllCookies();
});

When(
  "je force un sessionId inexistant dans le cookie de session AgentConnect",
  function () {
    const { federationRootUrl } = getEnv();
    setUnknowSessionIdInSessionCookie(federationRootUrl);
  },
);

Given("je supprime les cookies AgentConnect", function () {
  const { federationRootUrl } = getEnv();
  const url = new URL(federationRootUrl);
  const domain = url.hostname;
  cy.clearCookies({ domain });
});
