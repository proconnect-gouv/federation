import {
  basicErrorScenario,
  basicScenario,
  getAuthorizeUrl,
} from './mire.utils';

describe('Session', () => {
  // -- replace by either `fip1v2` or `fia1v2`
  const idpId = `${Cypress.env('IDP_NAME')}1v2`;

  it('should trigger error Y190001 (no session found)', () => {
    basicErrorScenario({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      errorCode: 'test',
      idpId,
    });

    cy.clearCookies();

    cy.get('#consent').click();

    cy.url().should('match', new RegExp(`\/login`));
    cy.hasError('Y190001');
  });

  it('should trigger error Y190001 if FC session cookie not set', () => {
    const authorizeUrl = getAuthorizeUrl();
    cy.visit(authorizeUrl);
    cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));

    cy.url().then((interactionUrl) => {
      cy.clearCookie('fc_session_id');
      cy.visit(interactionUrl, { failOnStatusCode: false });
      cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));
      cy.hasError('Y190001');
    });
  });

  it('should trigger error Y190001 if FC session cookie does not match found backend interaction', () => {
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
        cy.hasError('Y190001');
      });
    });
  });

  it('should have two cookies stored for SP with the property `sameSite` value set to `lax`', () => {
    cy.clearCookie('sp_session_id');
    cy.clearCookie('sp_interaction_id');
    cy.visit(Cypress.env('SP1_ROOT_URL'));
    cy.getCookies()
      .should('have.length', 2)
      .then((cookies) => {
        expect(cookies[1]).to.have.property('sameSite', 'lax');
      });
  });

  it('should have cookie stored for IdP with the property `sameSite` value set to `lax`', () => {
    cy.clearCookies();

    basicScenario({
      idpId,
      eidasLevel: 'eidas2',
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2',
      },
    });

    cy.getCookie('fc_session_id').then((cookie) => {
      const interactionId = cookie.value.match(/s%3A([^.]+)/).pop();
      cy.request({
        url: `${Cypress.env(
          'IDP_ROOT_URL',
        )}/interaction/${interactionId}/login`,
        method: 'POST',
        body: {
          login: 'test',
          password: '123',
          acr: 'eidas2',
        },
        form: true,
        followRedirect: false,
      })
        .as('idp:step1')
        .then(() => {
          cy.getCookie('fc_session_id').then((cookie) => {
            expect(cookie).to.have.property('sameSite', 'lax');
          });
        });
    });
  });
});
