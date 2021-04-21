import {
  basicSuccessScenario,
  checkInformations,
  checkInStringifiedJson,
  getServiceProvider,
  beforeSuccessScenario,
  afterSuccessScenario,
} from './mire.utils';

describe('Revoke token', () => {
  // -- replace by either `fip1v2` or `fia1v2`
  const idpId = `${Cypress.env('IDP_NAME')}1v2`;
  const { SP_ROOT_URL } = getServiceProvider(`${Cypress.env('SP_NAME')}1v2`);

  it('should trigger error Y030116 when token is revoked and we call userInfo endpoint', () => {
    const params = {
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
    };
    beforeSuccessScenario(params);
    basicSuccessScenario(idpId);
    afterSuccessScenario(params);

    // Check user information
    checkInformations({
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson(
      'sub',
      '2a22df139ea8e7a81ed542150441ece7959cb870cd3a45910d0984f4e0de7524',
    );

    // reload userinfo with valid token
    cy.get('#reload-userinfo').click();
    cy.url().should('include', `${SP_ROOT_URL}/me`);

    // Check user information
    checkInformations({
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson(
      'sub',
      '2a22df139ea8e7a81ed542150441ece7959cb870cd3a45910d0984f4e0de7524',
    );

    // revoke token
    cy.get('#revoke-token').click();
    cy.url().should('include', `${SP_ROOT_URL}/revocation`);
    cy.contains('Le token a été révoqué').should('be.visible');

    // reload userinfo with invalid token
    cy.get('#reload-userinfo').click();

    cy.url().should(
      'include',
      `${SP_ROOT_URL}/error?error=invalid_token&error_description=invalid%20token%20provided`,
    );

    cy.contains('Error: invalid_token').should('be.visible');
    cy.contains('invalid token provided').should('be.visible');
  });
});
