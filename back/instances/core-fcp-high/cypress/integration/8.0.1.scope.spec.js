import { getAuthorizeUrl } from './mire.utils';

describe('Scope', () => {
  /**
   * @TODO #197 Implement tests once feature is implemented in `oidc-client`
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/197
   */
  it.skip('should return to the SP with an "invalid_scope" error if the query contains scopes that are not whitelisted for this SP', () => {
    // First visit SP home page to initialize its session.
    cy.visit(Cypress.env('SP1_ROOT_URL'));

    const url = getAuthorizeUrl({
      scope: 'openid profile',
    });

    // Visit forged /authorize URL
    cy.visit(url, {
      failOnStatusCode: false,
    });

    cy.url().should(
      'match',
      new RegExp(`${Cypress.env('SP1_ROOT_URL')}/error`),
    );

    cy.get('#error-title').contains('invalid_scope');
    cy.get('#error-description').contains('requested scope is not whitelisted');
  });
});
