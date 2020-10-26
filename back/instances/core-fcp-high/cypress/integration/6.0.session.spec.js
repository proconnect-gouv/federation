import { basicErrorScenario, getAuthorizeUrl } from './mire.utils';

describe('Session', () => {
  it('should trigger error Y150003 (session not found)', () => {
    basicErrorScenario({
      errorCode: 'test',
      idpId: 'fip1v2',
    });

    cy.clearCookies();

    cy.get('#consent').click();

    cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/login`));
    cy.hasError('Y150003');
  });

  it('should trigger error Y150003 if FC session cookie not set', () => {
    const authorizeUrl = getAuthorizeUrl();
    cy.visit(authorizeUrl);
    cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));

    cy.url().then((interactionUrl) => {
      cy.clearCookie('fc_session_id');
      cy.visit(interactionUrl, { failOnStatusCode: false });
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
      cy.visit(interactionUrl, { failOnStatusCode: false });
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
        cy.visit(interactionUrl, { failOnStatusCode: false });
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
        cy.visit(interactionUrl, { failOnStatusCode: false });
        cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));
        cy.hasError('Y150005');
      });
    });
  });
});
