import {
  getAuthorizeUrl
} from './mire.utils';

describe('Scope', () => {
  it('should return to the SP with an "invalid_scope" error if the query contains scopes that are not whitelisted for this SP', () => {
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const url = getAuthorizeUrl({
      scope: 'openid profile',
    });

    cy.visit(url, {
      failOnStatusCode: false
    });

    cy.url().should(
      'match',
      new RegExp(`${Cypress.env('SP1_ROOT_URL')}/error`),
    );

    cy.get('#error-title').contains('invalid_scope');
    cy.get('#error-description').contains('requested scope is not whitelisted');
  });
});
