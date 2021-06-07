import {
  basicSuccessScenario,
  checkInformationsServiceProvider,
  checkInStringifiedJson,
  navigateToMire,
  getAuthorizeUrl,
} from './mire.utils';

describe('1.0 - Successful scenarios', () => {
  // -- replace by either `fip1v2` or `fia1v2`
  const idpId = `${Cypress.env('IDP_NAME')}1v2`;

  it('should redirect to FC website', () => {
    cy.request({
      url: `${Cypress.env('FC_ROOT_URL')}/api/v2`,
      method: 'GET',
      followRedirect: false,
    }).then((response) => {
      expect(response.status).to.eq(301);
      expect(response.headers.location).to.eq('https://franceconnect.gouv.fr');
    });
  });

  it('should log in to Service Provider Example', () => {
    basicSuccessScenario({
      userName: 'test',
      password: '123',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });
    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });

  it('should log in to Service Provider Example with POST /authorize', () => {
    basicSuccessScenario({
      userName: 'test',
      password: '123',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      idpId,
      method: 'POST',
    });

    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });

    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });

  it('should log in to Service Provider, an user born in Corse 2A', () => {
    basicSuccessScenario({
      userName: 'test_CORSE_2A',
      password: '123',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      idpId,
      method: 'POST',
    });

    checkInformationsServiceProvider({
      gender: 'Homme',
      givenName: 'Mario',
      familyName: 'Brosse',
      preferredUsername: 'Mario',
      birthdate: '1981-02-03',
      birthplace: '2A004',
      birthcountry: '99100',
    });
    checkInStringifiedJson(
      'sub',
      'ee0281b8150499ba220fb914a0e6f6aaf83e4673f6ffb0e669e210fbd1612a56v1',
    );
  });

  it('should log in to Service Provider, an user born in Corse 2B', () => {
    basicSuccessScenario({
      userName: 'test_CORSE_2B',
      password: '123',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      idpId,
      method: 'POST',
    });

    checkInformationsServiceProvider({
      gender: 'Homme',
      givenName: 'Luigi',
      familyName: 'Brosse',
      preferredUsername: 'Luigi',
      birthdate: '1981-02-03',
      birthplace: '2B050',
      birthcountry: '99100',
    });

    checkInStringifiedJson(
      'sub',
      '5dc66a1463be39c00c2826e5c16e161df7d9e3f897b88e8d8f267461d2cd6680v1',
    );
  });

  it('should log in to Service Provider Example a "présumé né jour"', () => {
    basicSuccessScenario({
      userName: 'étranger_présumé_né_jour',
      password: '123',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Homme',
      givenName: 'Jean',
      familyName: 'FLEURET',
      birthdate: '1992-11-00',
      birthcountry: '99217',
    });
    checkInStringifiedJson(
      'sub',
      '1498d9573ecba882e7038ea0407195f4f703d4e477db089e6cb3cbe723cb3b0fv1',
    );
  });

  it('should log in to Service Provider Example a "présumé né jour et mois"', () => {
    basicSuccessScenario({
      userName: 'étranger_présumé_né_jour_et_mois',
      password: '123',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Homme',
      givenName: 'Jean',
      familyName: 'TARGE',
      birthdate: '1992-00-00',
      birthcountry: '99217',
    });
    checkInStringifiedJson(
      'sub',
      '4718dec56cbcc6f581981c4ea987f0cdd219ae955f454f530e706c5f293321c8v1',
    );
  });

  it('should log in to Service Provider Example as anonymous"', () => {
    cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

    // Disable scopes
    cy.get('#scope_profile').click();
    cy.get('#scope_given_name').click();
    cy.get('#scope_family_name').click();
    cy.get('#scope_email').click();
    cy.get('#scope_preferred_username').click();
    cy.get('#scope_address').click();
    cy.get('#scope_phone').click();
    cy.get('#scope_identite_pivot').click();
    cy.get('#scope_birthdate').click();
    cy.get('#scope_birthplace').click();
    cy.get('#scope_birthcountry').click();
    cy.get('#scope_birth').click();
    cy.get('#scope_gender').click();

    // Go to FC
    cy.get('#acrSelector').select('eidas2');
    cy.get('#get-authorize').click();

    // Choose IdP
    cy.get(`#idp-fip1v2`).click();

    // Login
    cy.get('input[type=submit]').click();

    // Consent
    cy.get('main section').should(
      'contain',
      'Vous avez été connecté de façon anonyme',
    );
    cy.get('#consent').click();

    cy.get('#json-output').then((elem) => {
      const txt = elem.text().trim();
      const data = JSON.parse(txt);
      const keys = Object.keys(data);
      // Check we ONLY have sub and technical props
      expect(keys).to.deep.equal(['sub', 'aud', 'exp', 'iat', 'iss']);
    });

    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });

  it('should navigate by tab and enter on menu link', () => {
    navigateToMire();
    cy.get('body').tab();
    cy.focused().invoke('attr', 'href');

    //TODO: find how trigger a keypress on key enter instead
    //After many tests a key press on this keys it seems that it implicitly triggers a click on the focus element
    cy.focused().click();
    cy.url().should(
      'contains',
      '/error?error=access_denied&error_description=User%20auth%20aborted',
    );

    cy.get('#error-title').contains('Error: access_denied');
    cy.get('#error-description').contains('User auth aborted');
  });

  it('should apply box shadow when identity provider links are focused', () => {
    navigateToMire();
    cy.get('#idp-list form').each((item) => {
      cy.get(item)
        .find('div button')
        .invoke('attr', 'disabled')
        .then((isDisabled) => {
          if (!isDisabled) {
            cy.get(item).find('div button').focus();
            cy.get(item).find('div button').should('have.css', 'box-shadow');
            cy.get(item).find('div button').blur();
          }
        });
    });
  });

  it('should return to the SP with an "invalid_request" error if the query does not contain the "openid" scope', () => {
    // First visit SP home page to initialize its session.
    cy.visit(Cypress.env('SP1_ROOT_URL'));

    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const url = getAuthorizeUrl({
      scope: 'given_name',
    });

    // Visit forged /authorize URL
    cy.visit(url, {
      failOnStatusCode: false,
    });

    cy.url()
      .should('contains', `${Cypress.env(`SP1_ROOT_URL`)}/error`)
      .should(
        'contains',
        'error=invalid_request&error_description=openid%20scope%20must%20be%20requested%20when%20using%20the%20acr_values',
      );
  });

  describe('Send notification email on a successfull scenario', () => {
    beforeEach(() => {
      cy.resetTechnicalLog();
    });

    it('should log in to Service Provider Example and check notification email is sent', () => {
      basicSuccessScenario({
        userName: 'test',
        password: '123',
        eidasLevel: 1,
        idpId,
      });

      checkInformationsServiceProvider({
        gender: 'Femme',
        givenName: 'Angela Claire Louise',
        familyName: 'DUBOIS',
        birthdate: '1962-08-24',
        birthplace: '75107',
        birthcountry: '99100',
      });
      checkInStringifiedJson(
        'sub',
        '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
      );
      cy.verifyEmailIsSent('Notification de connexion à FranceConnect+');
    });
  });
});
