import {
  authenticateWithIdp,
  checkInStringifiedJson,
  configureSpAndClickFc,
  getAuthorizeUrl,
} from './mire.utils';

describe('8.0.1 - Scope', () => {
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
    // Restricted scopes
    const scopes = [
      'openid',
      'gender',
      'birthdate',
      'birthcountry',
      'birthplace',
    ];
    configureSpAndClickFc({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      sp: 'SP1',
      scopes,
    });

    // Choose IdP
    cy.get(`#idp-fip1-high`).click();

    // Login
    authenticateWithIdp({
      userName: 'test',
    });

    // Consent
    cy.get('#consent').click();

    checkInStringifiedJson('given_name', undefined);
    checkInStringifiedJson('family_name', undefined);
    checkInStringifiedJson('preferred_username', undefined);

    checkInStringifiedJson('email', undefined);
    checkInStringifiedJson('address', undefined);
    checkInStringifiedJson('phone_number', undefined);

    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
    checkInStringifiedJson('gender', 'female');
    checkInStringifiedJson('birthdate', '1962-08-24');
    checkInStringifiedJson('birthplace', '75107');
    checkInStringifiedJson('birthcountry', '99100');
  });

  describe('discovery endpoint', () => {
    it('should not have "offline_access" in supported scopes', () => {
      cy.request(`${Cypress.env('FC_ROOT_URL')}${Cypress.env('WELL_KNOWN')}`)
        .its('body')
        .then((body) => body.scopes_supported)
        .should('not.include', 'offline_access')
        .should('include', 'openid')
        .should('include', 'given_name')
        .should('include', 'family_name')
        .should('include', 'birthdate')
        .should('include', 'gender')
        .should('include', 'birthplace')
        .should('include', 'birthcountry')
        .should('include', 'email')
        .should('include', 'preferred_username')
        .should('include', 'profile')
        .should('include', 'birth')
        .should('include', 'identite_pivot');
    });
  });

  describe('end to end cinematic', () => {
    it('should send back all corresponding claims when aliases are not checked', () => {
      // All scopes but aliases
      const scopes = [
        'openid',
        'gender',
        'given_name',
        'family_name',
        'preferred_username',
        'birthdate',
        'birthcountry',
        'birthplace',
        'email',
        'address',
        'phone',
      ];

      configureSpAndClickFc({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2',
        sp: 'SP1',
        method: 'GET',
        scopes,
      });

      // Choose IdP
      cy.get(`#idp-fip1-high`).click();

      // Login
      authenticateWithIdp({
        userName: 'avec_nom_dusage',
      });

      // Consent
      cy.get('#consent').click();

      checkInStringifiedJson('gender', 'male');
      checkInStringifiedJson('birthdate', '1969-03-17');
      checkInStringifiedJson('birthcountry', '99100');
      checkInStringifiedJson('birthplace', '95277');
      checkInStringifiedJson('given_name', 'Pierre');
      checkInStringifiedJson('family_name', 'MERCIER');
      checkInStringifiedJson('email', 'ymmyffarapp-1777@yopmail.com');
      checkInStringifiedJson('preferred_username', 'DUBOIS');
      checkInStringifiedJson('address', {
        country: 'France',
        formatted: 'France Paris 75107 20 avenue de Ségur',
        locality: 'Paris',
        // openid defined property names
        // eslint-disable-next-line @typescript-eslint/naming-convention
        postal_code: '75107',
        // openid defined property names
        // eslint-disable-next-line @typescript-eslint/naming-convention
        street_address: '20 avenue de Ségur',
      });
      checkInStringifiedJson('phone_number', '623456789');

      checkInStringifiedJson(
        'sub',
        'faa0788fe8845bdcd6c993dcd4a42ce0d0f6cfe69f180c36ad145b0dd31e1cedv1',
      );
    });

    it('should send back birthplace and birthcountry when you choose birth alias', () => {
      cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

      // We select only birth
      const scopes = ['openid', 'birth'];

      configureSpAndClickFc({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2',
        sp: 'SP1',
        method: 'GET',
        scopes,
      });

      // Choose IdP
      cy.get(`#idp-fip1-high`).click();

      // Login
      authenticateWithIdp({
        userName: 'avec_nom_dusage',
      });

      // Consent
      cy.get('#consent').click();

      checkInStringifiedJson('gender', undefined);
      checkInStringifiedJson('birthdate', undefined);
      checkInStringifiedJson('birthcountry', '99100');
      checkInStringifiedJson('birthplace', '95277');
      checkInStringifiedJson('given_name', undefined);
      checkInStringifiedJson('family_name', undefined);
      checkInStringifiedJson('email', undefined);
      checkInStringifiedJson('preferred_username', undefined);
      checkInStringifiedJson('address', undefined);
      checkInStringifiedJson('phone_number', undefined);
      checkInStringifiedJson(
        'sub',
        'faa0788fe8845bdcd6c993dcd4a42ce0d0f6cfe69f180c36ad145b0dd31e1cedv1',
      );
    });

    it('should send back right claims when you choose identite_pivot alias', () => {
      cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

      // We select only identite_pivot
      const scopes = ['openid', 'identite_pivot'];

      configureSpAndClickFc({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2',
        sp: 'SP1',
        method: 'GET',
        scopes,
      });

      // Choose IdP
      cy.get(`#idp-fip1-high`).click();

      // Login
      authenticateWithIdp({
        userName: 'avec_nom_dusage',
      });

      // Consent
      cy.get('#consent').click();

      checkInStringifiedJson('gender', 'male');
      checkInStringifiedJson('birthdate', '1969-03-17');
      checkInStringifiedJson('birthcountry', '99100');
      checkInStringifiedJson('birthplace', '95277');
      checkInStringifiedJson('given_name', 'Pierre');
      checkInStringifiedJson('family_name', 'MERCIER');
      checkInStringifiedJson(
        'sub',
        'faa0788fe8845bdcd6c993dcd4a42ce0d0f6cfe69f180c36ad145b0dd31e1cedv1',
      );
      checkInStringifiedJson('preferred_username', undefined);
      checkInStringifiedJson('email', undefined);
      checkInStringifiedJson('address', undefined);
      checkInStringifiedJson('phone_number', undefined);
    });

    it('should send back right claims when you choose profile alias', () => {
      cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

      // We select only profile
      const scopes = ['openid', 'profile'];

      configureSpAndClickFc({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2',
        sp: 'SP1',
        method: 'GET',
        scopes,
      });

      // Choose IdP
      cy.get(`#idp-fip1-high`).click();

      // Login
      authenticateWithIdp({
        userName: 'avec_nom_dusage',
      });
      // Consent
      cy.get('#consent').click();

      checkInStringifiedJson('gender', 'male');
      checkInStringifiedJson('birthdate', '1969-03-17');
      checkInStringifiedJson('given_name', 'Pierre');
      checkInStringifiedJson('family_name', 'MERCIER');
      checkInStringifiedJson('preferred_username', 'DUBOIS');
      checkInStringifiedJson(
        'sub',
        'faa0788fe8845bdcd6c993dcd4a42ce0d0f6cfe69f180c36ad145b0dd31e1cedv1',
      );
      checkInStringifiedJson('birthplace', undefined);
      checkInStringifiedJson('birthcountry', undefined);
      checkInStringifiedJson('email', undefined);
      checkInStringifiedJson('address', undefined);
      checkInStringifiedJson('phone_number', undefined);
    });
  });
});
