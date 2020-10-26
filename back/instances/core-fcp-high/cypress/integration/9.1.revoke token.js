import {
  basicSuccessScenario,
  checkInformations,
  checkInStringifiedJson
} from './mire.utils';

describe('Revoke token', () => {
  it('should trigger error Y030116 when token is revoked and we call userInfo endpoint', () => {
    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'fip1v2',
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
    checkInStringifiedJson('sub', 'b155a2129530e5fd3f6b95275b6da72a99ea1a486b8b33148abb4a62ddfb3609v2');

    // reload userinfo with valid token
    cy.get('#reload-userinfo').click();
    cy.url().should(
      'include',
      `${Cypress.env('SP1_ROOT_URL')}/me`,
    );

    // Check user information
    checkInformations({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });
    checkInStringifiedJson('sub', 'b155a2129530e5fd3f6b95275b6da72a99ea1a486b8b33148abb4a62ddfb3609v2');

    // revoke token
    cy.get('#revoke-token').click();
    cy.url().should(
      'include',
      `${Cypress.env('SP1_ROOT_URL')}/revocation`,
    );
    cy.contains('Le token a été révoqué').should('be.visible');

    // reload userinfo with invalid token
    cy.get('#reload-userinfo').click();

    cy.url().should(
      'include',
      `${Cypress.env('SP1_ROOT_URL')}/error?error=invalid_token&error_description=invalid%20token%20provided`,
    );

    cy.contains('Error: invalid_token').should('be.visible');
    cy.contains('invalid token provided').should('be.visible');
  });
});
