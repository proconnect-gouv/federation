import {
  basicErrorScenario,
  getAuthorizeUrl,
  callInteractionByBack,
} from './mire.utils';

describe('Session', () => {
  // -- replace by either `fip1v2` or `fia1v2`
  const idpId = `${Cypress.env('IDP_NAME')}1v2`;

  /**
   * @TODO #306 Backport this test from core-fcp :
   * We can't reproduce easily the clearCookie only once back from idp
   * since there is no more consent page.
   *
   * We could duplicate `basicScenario`
   * but we would still have to be able to act between HTTP redirections
   *
   * Maybe we can find another way to create this test
   * (clear only core-fca cookies ?)
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/306
   */
  it.skip('should trigger error Y150003 (session not found)', () => {
    basicErrorScenario({
      errorCode: 'test',
      idpId,
    });

    cy.clearCookies();

    cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/login`));
    cy.hasError('Y150003');
  });

  it('should trigger error Y150003 if FC session cookie not set', () => {
    const authorizeUrl = getAuthorizeUrl();
    cy.visit(authorizeUrl);
    cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));

    cy.url().then((interactionUrl) => {
      cy.clearCookie('fc_session_id');
      const interactionUrlFormatted = callInteractionByBack(interactionUrl);
      cy.visit(interactionUrlFormatted, { failOnStatusCode: false });
      cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));
      cy.hasError('Y150003');
    });
  });

  it('should trigger error Y150004 if FC interaction cookie not set', () => {
    const authorizeUrl = getAuthorizeUrl();
    cy.visit(authorizeUrl);
    cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));

    cy.url().then((interactionUrl) => {
      cy.clearCookie('fc_interaction_id');
      const interactionUrlFormatted = callInteractionByBack(interactionUrl);
      cy.visit(interactionUrlFormatted, { failOnStatusCode: false });
      cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));
      cy.hasError('Y150004');
    });
  });

  it('should trigger error Y150001 if FC interaction cookie does not match any backend interaction', () => {
    const authorizeUrl = getAuthorizeUrl();
    cy.visit(authorizeUrl);
    cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));

    cy.url().then((interactionUrl) => {
      /**
       * Forged cookie
       * We override cookie while keeping signature...
       *
       * We have to get existing cookie and edit its value,
       * otherwise it is not reconnized as a signed cookie
       * and we get an error Y150004 which is not what we want to test here.
       */
      cy.getCookie('fc_interaction_id').then((cookie) => {
        cy.setCookie(
          'fc_interaction_id',
          // Replace the begining of the cookie by arbitratry value
          cookie.value.replace(/^s%3A(.){4}/, 's%3Arofl'),
          {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            domain: Cypress.env('APP_DOMAIN'),
          },
        );
        const interactionUrlFormatted = callInteractionByBack(interactionUrl);
        cy.visit(interactionUrlFormatted, { failOnStatusCode: false });
        cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));
        cy.hasError('Y150001');
      });
    });
  });

  it('should trigger error Y150005 if FC session cookie does not match found backend interaction', () => {
    const authorizeUrl = getAuthorizeUrl();
    cy.visit(authorizeUrl);
    cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));

    cy.url().then((interactionUrl) => {
      /**
       * Forged cookie
       * We override cookie while keeping signature...
       *
       * We have to get existing cookie and edit its value,
       * otherwise it is not reconnized as a signed cookie
       * and we get an error Y150004 which is not what we want to test here.
       */
      cy.getCookie('fc_session_id').then((cookie) => {
        cy.setCookie(
          'fc_session_id',
          // Replace the begining of the cookie by arbitratry value
          cookie.value.replace(/^s%3A(.){4}/, 's%3Arofl'),
          {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            domain: Cypress.env('APP_DOMAIN'),
          },
        );
        const interactionUrlFormatted = callInteractionByBack(interactionUrl);
        cy.visit(interactionUrlFormatted, { failOnStatusCode: false });
        cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));
        cy.hasError('Y150005');
      });
    });
  });
});
