import url from 'url';

function interceptAuthorizeToCheckParams() {
  /**
   * The "?" is necessary because otherwise cypress match a curious who only
   * exists in its environment :
   * ${Cypress.env('CORE_ROOT_URL')}/api/v2/authorize/:uid
   */
  cy.intercept(`${Cypress.env('CORE_ROOT_URL')}/api/v2/authorize?`).as(
    'authorizeQuery',
  );
}

function connectToFcIdp(fcRequest) {
  const { idpId, login = 'test', password = '123' } = fcRequest;

  // FC: choose FI
  cy.url().should(
    'include',
    `${Cypress.env('CORE_ROOT_URL')}/api/v2/interaction`,
  );
  cy.get(`#idp-${idpId}`).click();

  // FI: Authenticate
  cy.url().should(
    'include',
    `${Cypress.env('IDP_ROOT_URL').replace('IDP_NAME', idpId)}/interaction`,
  );
  cy.get('input[name="login"]').clear().type(login);
  cy.get('input[name="password"]').clear().type(password);

  cy.get('input[type="submit"]').click();

  cy.get('#consent').click();
}

function configureEidasSpMockRequest(eidasRequest = {}) {
  cy.server();

  const request = {
    nameId: 'unspecified',
    loa: 'E',
    loaCompareType: 'minimum',
    spType: 'public',
    naturalPersonAttributes: [
      // Type = Mandatory / Optional / NoRequest
      { name: 'BirthName', type: 'Mandatory' },
      { name: 'FamilyName', type: 'Mandatory' },
      { name: 'FirstName', type: 'Mandatory' },
      { name: 'DateOfBirth', type: 'Mandatory' },
      { name: 'PersonIdentifier', type: 'Mandatory' },
      { name: 'Gender', type: 'Mandatory' },
      { name: 'PlaceOfBirth', type: 'Mandatory' },
    ],
    ...eidasRequest,
  };

  cy.visit(Cypress.env('BE_SP_URL'));

  cy.get('#eidasconnector_msdd').click();
  cy.get('#eidasconnector_msdd .enabled._msddli_').contains('BE').click();

  cy.get('#citizeneidas_msdd').click();
  cy.get('#citizeneidas_msdd .enabled._msddli_').contains('FR').click();

  cy.get('#eidasNameIdentifier').select(request.nameId);
  cy.get('#eidasloa').select(request.loa);
  cy.get('#eidasloaCompareType').select(request.loaCompareType);
  cy.get('#eidasSPType').select(request.spType);

  cy.get('#check_all_NoRequestEidas').click();
  cy.get('#tab2_toggle1').click();

  request.naturalPersonAttributes.forEach(({ name, type }) => {
    cy.get(`#${type}_${name}Eidas`).click();
  });

  // Submit configuration
  cy.get('#submit_tab2').click();

  // We need to remove the target "_parent" from the form to run cypress tests that are a frame
  cy.get('#countrySelector').invoke('removeAttr', 'target');

  // Submit request
  cy.get('#submit_saml').click();
}

/**
 * @param params
 * Available params :
 *  - eidasRequest
 *    + see the function "configureEidasSpMockRequest"
 *  - LogWith
 *    + idpId
 *    + userName
 *    + password
 */
export function basicSuccessScenarioEuSpFrIdp(params) {
  const { eidasRequest, logWith } = params;

  interceptAuthorizeToCheckParams();
  configureEidasSpMockRequest(eidasRequest);
  connectToFcIdp(logWith);

  // We need to remove the target "_parent" from the form to run cypress tests that are a frame
  // Yes, the id does not match the page, tell that to eIDAS devs :p
  cy.get('#countrySelector').invoke('removeAttr', 'target');

  // Submit response
  cy.get('#submit_saml').click();
}

export function checkInformationsEuSpFrIdp(params = {}) {
  const {
    expectedAuthorize = {
      scope:
        'openid family_name preferred_username given_name birthdate gender birthplace birthcountry',
      // oidc parameter
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas3',
    },
    expectedIdentity = [
      { name: 'BirthName', value: '[DUBOIS]' },
      { name: 'FamilyName', value: '[DUBOIS]' },
      { name: 'FirstName', value: '[Claire, Angela, Louise]' },
      { name: 'DateOfBirth', value: '[1962-08-24]' },
      { name: 'Gender', value: '[Female]' },
      {
        name: 'PersonIdentifier',
        value:
          '[FR/BE/082aef8c0d31e99d83d910879a4fcdd8610d571f07ce5610440b3a0161f6e393v1]',
      },
      { name: 'PlaceOfBirth', value: '[75107]' },
    ],
  } = params;

  cy.wait('@authorizeQuery').then(({ request }) => {
    const { query } = url.parse(request.url, { parseQueryString: true });
    expect(query).to.include(expectedAuthorize);
  });

  expectedIdentity.forEach(({ name, value }) => {
    cy.get('table.table-striped')
      .contains(name)
      .parent('tr')
      .within(() => {
        cy.get('td').eq(0).contains(name);
        cy.get('td').eq(1).contains(value);
      });
  });
}
