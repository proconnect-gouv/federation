import {
  basicSuccessScenario,
  checkInformations,
  checkInStringifiedJson,
} from './mire.utils';

describe('Revoke token', () => {
  // -- replace by either `fip1v2` or `fia1v2`
  const idpId = `${Cypress.env('IDP_NAME')}1v2`;

  it('should trigger error Y030116 when token is revoked and we call userInfo endpoint', () => {
    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    // Check user information
    checkInformations({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });
    checkInStringifiedJson(
      'sub',
      '71e5edab9c105c02ae0b5bce93d41e52e3ebd66d8063577f75e5f29e7982defdv1',
    );

    // reload userinfo with valid token
    cy.get('#reload-userinfo').click();
    cy.url().should('include', `${Cypress.env('SP1_ROOT_URL')}/me`);

    // Check user information
    checkInformations({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });
    checkInStringifiedJson(
      'sub',
      '71e5edab9c105c02ae0b5bce93d41e52e3ebd66d8063577f75e5f29e7982defdv1',
    );

    // revoke token
    cy.get('#revoke-token').click();
    cy.url().should('include', `${Cypress.env('SP1_ROOT_URL')}/revocation`);
    cy.contains('Le token a été révoqué').should('be.visible');

    // reload userinfo with invalid token
    cy.get('#reload-userinfo').click();

    cy.url().should(
      'include',
      `${Cypress.env(
        'SP1_ROOT_URL',
      )}/error?error=invalid_token&error_description=invalid%20token%20provided`,
    );

    cy.contains('Error: invalid_token').should('be.visible');
    cy.contains('invalid token provided').should('be.visible');
  });
});
