import {
  chooseIdpOnCore,
  checkInStringifiedJson,
  getAuthorizeUrl,
} from './mire.utils';

describe('Scope', () => {
  /**
   * @TODO #197 Implement tests once feature is implemented in `oidc-client`
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/197
   */
  it.skip('should return to the SP with an "invalid_scope" error if the query contains scopes that are not whitelisted for this SP', () => {
    // First visit SP home page to initialize its session.
    cy.visit(Cypress.env('SP1_ROOT_URL'));

    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
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

  it('should send back all mandatory fields and all non mandatory created fields', () => {
    cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

    cy.get('#post-authorize').click();
    chooseIdpOnCore('fia1v2');
    cy.get('input[type=submit]').click();

    checkInStringifiedJson('given_name', 'Angela Claire Louise'); // mandatory
    checkInStringifiedJson('usual_name', 'DUBOIS'); // mandatory
    checkInStringifiedJson('email', 'test@abcd.com'); // mandatory
    checkInStringifiedJson('siret', '123abcd5612345'); // not mandatory
    checkInStringifiedJson('siren', '12346AZER'); // not mandatory
    checkInStringifiedJson(
      'sub',
      'c2a305b1162c7b0f44923049dec15ca6189ff454dde89e8a41535c291aae86f9v1',
    ); // mandatory
    checkInStringifiedJson('organizational_unit', 'comptabilite'); // mandatory
    checkInStringifiedJson('belonging_population', 'agent'); // not mandatory
  });

  it('should work even if a non mandatory scope, not existing for the agent, is claimed', () => {
    cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

    cy.get('#post-authorize').click();
    chooseIdpOnCore('fia1v2');
    cy.get('#login').clear().type('12551');
    cy.get('input[type=submit]').click();

    checkInStringifiedJson('given_name', 'Gils'); // mandatory
    checkInStringifiedJson('usual_name', 'Martinot'); // mandatory
    checkInStringifiedJson('email', 'test@abcd.com'); // mandatory
    checkInStringifiedJson(
      'sub',
      'c6a6e1847cb13dea4b8104e44b4de7b57353fc57071d28ef40800c29dc5c3c71v1',
    ); // mandatory
    checkInStringifiedJson('belonging_population', undefined);
  });

  it('should not return optional claims not asked by scope', () => {
    cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

    cy.get('#scope_siren').click();
    cy.get('#scope_siret').click();
    cy.get('#scope_belonging_population').click();
    cy.get('#scope_organizational_unit').click();
    cy.get('#scope_phone').click();

    cy.get('#post-authorize').click();
    chooseIdpOnCore('fia1v2');
    cy.get('input[type=submit]').click();

    checkInStringifiedJson('given_name', 'Angela Claire Louise'); // mandatory
    checkInStringifiedJson('usual_name', 'DUBOIS'); // mandatory
    checkInStringifiedJson('email', 'test@abcd.com'); // mandatory
    checkInStringifiedJson(
      'sub',
      'c2a305b1162c7b0f44923049dec15ca6189ff454dde89e8a41535c291aae86f9v1',
    ); // mandatory
    checkInStringifiedJson('organizational_unit', undefined); // mandatory
    checkInStringifiedJson('belonging_population', undefined);
    checkInStringifiedJson('siren', undefined); // not mandatory
    checkInStringifiedJson('siret', undefined); // not mandatory
  });

  it('should not return mandatory claims not asked by scope', () => {
    cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

    cy.get('#scope_email').click();

    cy.get('#post-authorize').click();
    chooseIdpOnCore('fia1v2');
    cy.get('input[type=submit]').click();

    checkInStringifiedJson('given_name', 'Angela Claire Louise'); // mandatory
    checkInStringifiedJson('usual_name', 'DUBOIS'); // mandatory
    checkInStringifiedJson('email', undefined); // mandatory
  });

  describe('discovery endpoint', () => {
    it('should not have "offline_access" in supported scopes', () => {
      cy.request(`${Cypress.env('FC_ROOT_URL')}${Cypress.env('WELL_KNOWN')}`)
        .its('body')
        .then((body) => body.scopes_supported)
        .should('not.include', 'offline_access')
        .and('include', 'openid')
        .and('include', 'given_name')
        .and('include', 'family_name')
        .and('include', 'birthdate')
        .and('include', 'gender')
        .and('include', 'birthplace')
        .and('include', 'birthcountry')
        .and('include', 'email')
        .and('include', 'preferred_username')
        .and('include', 'profile');
    });
  });
});
