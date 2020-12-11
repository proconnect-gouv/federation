import { getAuthorizeUrl, checkInStringifiedJson } from './mire.utils';

describe('8.0.1 Scope', () => {
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

  it('should work with restricted scope', () => {
    cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

    // Disable scopes
    cy.get('#scope_profile').click();
    cy.get('#scope_given_name').click();
    cy.get('#scope_family_name').click();
    cy.get('#scope_email').click();
    cy.get('#scope_preferred_username').click();
    cy.get('#scope_address').click();
    cy.get('#scope_phone').click();

    // Go to FC
    cy.get('#get-authorize').click();

    // Choose IdP
    cy.get(`#idp-fip1v2`).click();

    // Login
    cy.get('input[type=submit]').click();

    // Consent
    cy.get('#consent').click();

    checkInStringifiedJson('given_name', undefined);
    checkInStringifiedJson('family_name', undefined);
    checkInStringifiedJson('email', undefined);

    checkInStringifiedJson('preferred_username', undefined);
    checkInStringifiedJson('email', undefined);
    checkInStringifiedJson('address', undefined);
    checkInStringifiedJson('phone_number', undefined);

    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
    checkInStringifiedJson('birthdate', '1962-08-24');
    checkInStringifiedJson('birthplace', '75107');
    checkInStringifiedJson('birthcountry', '99100');
  });
});
