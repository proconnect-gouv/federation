import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

import {
  checkCookieExists,
  getCookieFromUrl,
  setUnknowSessionIdInSessionCookie,
} from '../helpers';

Then(
  /^le cookie "([^"]+)" est (présent|absent|supprimé)$/,
  function (cookieName: string, text: string) {
    const existNotExist = text === 'présent' ? 'exist' : 'not.exist';
    const { fcRootUrl } = this.env;
    getCookieFromUrl(cookieName, fcRootUrl).should(existNotExist);
  },
);

When(
  /^je mémorise la valeur du cookie "([^"]+)"$/,
  function (cookieName: string) {
    const { fcRootUrl } = this.env;
    getCookieFromUrl(cookieName, fcRootUrl)
      .should('exist')
      .as(`cookie:${cookieName}`);
  },
);

Then(
  /^la valeur du cookie "([^"]+)" est (identique|différente)$/,
  function (cookieName: string, text: string) {
    const { fcRootUrl } = this.env;
    const equalNotEqual = text === 'identique' ? 'equal' : 'not.equal';
    cy.get<Cypress.Cookie>(`@cookie:${cookieName}`).then((previousCookie) => {
      expect(previousCookie).to.exist;
      const { value: previousValue } = previousCookie;

      getCookieFromUrl(cookieName, fcRootUrl)
        .should('exist')
        .its('value')
        .should(equalNotEqual, previousValue);
    });
  },
);

Then('les cookies FranceConnect sont présents', function () {
  const platform: string = Cypress.env('PLATFORM');
  const { fcRootUrl, name } = this.env;
  const url = new URL(fcRootUrl);
  const domain = url.hostname;

  // FC uses session cookies only on fcp-high
  const isSessionCookie = platform === 'fcp-high';
  checkCookieExists('fc_session_id', domain, isSessionCookie);

  cy.getCookies({ domain })
    .should('have.length', 5)
    .then((cookies: Cypress.Cookie[]) => {
      // FC cookies are intercepted by Cypress on integ01.
      // We force sameSite=none to test cross-domain.
      // The sameSite check can only be done on the docker environment.
      if (name === 'docker') {
        cookies.forEach((cookie) =>
          expect(cookie).to.have.property('sameSite', 'lax'),
        );
      }
    });
});

When(
  'je force un sessionId inexistant dans le cookie de session FranceConnect',
  function () {
    const { fcRootUrl } = this.env;
    setUnknowSessionIdInSessionCookie(fcRootUrl);
  },
);

Given('je supprime les cookies FranceConnect', function () {
  const { fcRootUrl } = this.env;
  const url = new URL(fcRootUrl);
  const domain = url.hostname;
  cy.clearCookies({ domain });
});

Given('je supprime les cookies du FS Mock', function () {
  const { url: spUrl } = this.serviceProvider;
  const url = new URL(spUrl);
  const domain = url.hostname;
  cy.clearCookie('sp_session_id', { domain });
});

Given('je supprime tous les cookies', function () {
  cy.clearAllCookies();
});
