import {
  chooseIdpOnCore,
  checkInStringifiedJson,
  getAuthorizeUrl,
  getServiceProvider,
} from './mire.utils';

describe('Scope', () => {
  const { SP_ROOT_URL } = getServiceProvider(`${Cypress.env('SP_NAME')}1v2`);

  /**
   * @TODO #197 Implement tests once feature is implemented in `oidc-client`
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/197
   */
  it.skip('should return to the SP with an "invalid_scope" error if the query contains scopes that are not whitelisted for this SP', () => {
    // First visit SP home page to initialize its session.
    cy.visit(SP_ROOT_URL);

    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const url = getAuthorizeUrl({
      scope: 'openid profile',
    });

    // Visit forged /authorize URL
    cy.visit(url, {
      failOnStatusCode: false,
    });

    cy.url().should('match', new RegExp(`${SP_ROOT_URL}/error`));

    cy.get('#error-title').contains('invalid_scope');
    cy.get('#error-description').contains('requested scope is not whitelisted');
  });

  it('should send back all mandatory fields and all non mandatory created fields', () => {
    cy.visit(`${SP_ROOT_URL}`);

    cy.get('#post-authorize').click();
    chooseIdpOnCore('fia1v2');
    cy.get('button[type=submit]').click();

    checkInStringifiedJson('given_name', 'Angela Claire Louise'); // mandatory
    checkInStringifiedJson('usual_name', 'DUBOIS'); // mandatory
    checkInStringifiedJson('email', 'test@abcd.com'); // mandatory
    checkInStringifiedJson('siret', '34329377500037'); // not mandatory
    checkInStringifiedJson('siren', '343293775'); // not mandatory
    checkInStringifiedJson(
      'sub',
      '2a22df139ea8e7a81ed542150441ece7959cb870cd3a45910d0984f4e0de7524',
    ); // mandatory
    checkInStringifiedJson('organizational_unit', 'comptabilite'); // mandatory
    checkInStringifiedJson('belonging_population', 'agent'); // not mandatory
  });

  it('should work even if a non mandatory scope, not existing for the agent, is claimed', () => {
    cy.visit(`${SP_ROOT_URL}`);

    cy.get('#post-authorize').click();
    chooseIdpOnCore('fia1v2');
    cy.get('#login').clear().type('12551');
    cy.get('button[type=submit]').click();

    checkInStringifiedJson('given_name', 'Gils'); // mandatory
    checkInStringifiedJson('usual_name', 'Martinot'); // mandatory
    checkInStringifiedJson('email', 'test@abcd.com'); // mandatory
    checkInStringifiedJson(
      'sub',
      'e0e18c40239dadc516017381052e74522091f1ed095143a38620feaa544997fd',
    ); // mandatory
    checkInStringifiedJson('belonging_population', undefined);
  });

  it('should not return optional claims not asked by scope', () => {
    cy.visit(`${SP_ROOT_URL}`);

    cy.get('#scope_siren').click();
    cy.get('#scope_siret').click();
    cy.get('#scope_belonging_population').click();
    cy.get('#scope_organizational_unit').click();
    cy.get('#scope_phone').click();

    cy.get('#post-authorize').click();
    chooseIdpOnCore('fia1v2');
    cy.get('button[type=submit]').click();

    checkInStringifiedJson('given_name', 'Angela Claire Louise'); // mandatory
    checkInStringifiedJson('usual_name', 'DUBOIS'); // mandatory
    checkInStringifiedJson('email', 'test@abcd.com'); // mandatory
    checkInStringifiedJson(
      'sub',
      '2a22df139ea8e7a81ed542150441ece7959cb870cd3a45910d0984f4e0de7524',
    ); // mandatory
    checkInStringifiedJson('organizational_unit', undefined); // mandatory
    checkInStringifiedJson('belonging_population', undefined);
    checkInStringifiedJson('siren', undefined); // not mandatory
    checkInStringifiedJson('siret', undefined); // not mandatory
  });

  it('should not return mandatory claims not asked by scope', () => {
    cy.visit(`${SP_ROOT_URL}`);

    cy.get('#scope_email').click();

    cy.get('#post-authorize').click();
    chooseIdpOnCore('fia1v2');
    cy.get('button[type=submit]').click();

    checkInStringifiedJson('given_name', 'Angela Claire Louise'); // mandatory
    checkInStringifiedJson('usual_name', 'DUBOIS'); // mandatory
    checkInStringifiedJson('email', undefined); // mandatory
  });

  it('should send back right claims when you choose all scopes except aliases', () => {
    cy.visit(`${SP_ROOT_URL}`);

    // Disable aliases
    cy.get('#scope_uid').click();
    cy.get('#scope_siren').click();
    cy.get('#scope_siret').click();
    cy.get('#scope_organizational_unit').click();
    cy.get('#scope_belonging_population').click();
    cy.get('#scope_phone').click();
    cy.get('#scope_chorusdt').click();

    // Go to FC
    cy.get('#get-authorize').click();

    // Choose IdP
    cy.get(`#fi-search-term`).type('identity');
    cy.contains('Identity Provider 1 - eIDAS élevé').click();

    // Connect
    cy.get('form').submit();

    checkInStringifiedJson(
      'sub',
      '2a22df139ea8e7a81ed542150441ece7959cb870cd3a45910d0984f4e0de7524',
    );
    checkInStringifiedJson('given_name', 'Angela Claire Louise');
    checkInStringifiedJson('usual_name', 'DUBOIS');
    checkInStringifiedJson('email', 'test@abcd.com');
  });

  describe('discovery endpoint', () => {
    it('should not have "offline_access" in supported scopes', () => {
      cy.request(`${Cypress.env('FC_ROOT_URL')}${Cypress.env('WELL_KNOWN')}`)
        .its('body')
        .then((body) => body.scopes_supported)
        .should('not.include', 'offline_access');
    });

    it('should have a determined list of scopes in supported scopes', () => {
      cy.request(`${Cypress.env('FC_ROOT_URL')}${Cypress.env('WELL_KNOWN')}`)
        .its('body')
        .then((body) => body.scopes_supported)
        .should('include', 'openid')
        .and('include', 'given_name')
        .and('include', 'usual_name')
        .and('include', 'email')
        .and('include', 'siren')
        .and('include', 'siret')
        .and('include', 'organizational_unit')
        .and('include', 'belonging_population')
        .and('include', 'phone')
        .and('include', 'chorusdt');
    });
  });
});
