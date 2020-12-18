import * as QueryString from 'querystring';

/**
 * @param params
 *
 * Available params :
 *  - idpId
 *  - userName
 *  - password
 *  - sp Name of the SP, possible values: SP1, SP2
 *  - acr_values
 */
export function basicSuccessScenario(params) {
  const { idpId, userName, sp = 'SP1', method } = params;
  const password = params.password || '123';

  const serviceProvider = {
    url: Cypress.env(`${sp}_ROOT_URL`),
    id: Cypress.env(`${sp}_CLIENT_ID`),
  };

  // FS: Click on FC button
  cy.visit(serviceProvider.url);

  if (method === 'POST') {
    cy.get('#post-authorize').click();
  } else {
    cy.get('#get-authorize').click();
  }

  // FC: choose FI
  cy.url().should(
    'include',
    `${Cypress.env('FC_ROOT_URL')}/api/v2/interaction`,
  );

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FC_AUTHORIZE_INITIATED',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId: null,
    idpName: null,
    idpAcr: null,
  });
  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FC_SHOWED_IDP_CHOICE',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId: null,
    idpName: null,
    idpAcr: null,
  });

  chooseIdpOnCore(idpId);

  // FI: Authenticate
  cy.url().should('include', Cypress.env('IDP_INTERACTION_URL'));

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'IDP_CHOSEN',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId, // idpId is set
    idpAcr: null, // idpAct is still null
  });

  cy.get('input[name="login"]').clear().type(userName);
  cy.get('input[name="password"]').clear().type(password);
  cy.get('input[type="submit"]').click();

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FC_REQUESTED_IDP_TOKEN',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId, // idpId is now set
    idpAcr: null, // idpAcr is still null
  });

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FC_REQUESTED_IDP_USERINFO',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId,
    idpAcr: null, // idpAcr is still null
  });

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FC_REDIRECTED_TO_SP',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values,
  });

  cy.hasBusinessLog({
    category: 'BACK_CINEMATIC',
    event: 'SP_REQUESTED_FC_TOKEN',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values,
  });

  cy.hasBusinessLog({
    category: 'BACK_CINEMATIC',
    event: 'SP_REQUESTED_FC_USERINFO',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values,
  });
}

export function checkInformations(identity) {
  const { givenName, familyName } = identity;

  checkInStringifiedJson('given_name', givenName);
  checkInStringifiedJson('usual_name', familyName);
}

export function checkInStringifiedJson(key, value, selector = '#json') {
  cy.get(selector).then((elem) => {
    const txt = elem.text().trim();
    const data = JSON.parse(txt);

    if (value === undefined) {
      expect(data).not.to.have.property(key);
    } else {
      expect(data).to.have.property(key);
      expect(data[key]).to.eq(value);
    }
  });
}

export function chooseIdpOnCore(idpId) {
  // FC: choose FI
  cy.url().should(
    'include',
    `${Cypress.env('FC_ROOT_URL')}/api/v2/interaction`,
  );

  cy.get(`#select-ministry`).click();
  cy.get(`#ministry-ministry1`).click();
  cy.get(`#idp-selects`).click();
  cy.get(`#idp-${idpId}`).click();
  cy.get('#idp-go').click();
}

export function basicScenario(params) {
  const {
    idpId,
    login = 'test',
    // eidasLevel, see comment below
    start = Cypress.env('SP1_ROOT_URL'),
    overrideParams,
  } = params;
  const password = '123';

  cy.visit(start);

  if (overrideParams) {
    // Steal the state to finish the cinematic
    cy.get('input[name=state]').invoke('val').as('url:state');
    cy.get('input[name=nonce]').invoke('val').as('url:nonce');

    cy.get('@url:nonce').then(($nonce) => {
      cy.get('@url:state').then(($state) => {
        // Direct call to FC with custom params
        const controlUrl = getAuthorizeUrl({
          ...overrideParams,
          state: $state,
          nonce: $nonce,
        });
        cy.visit(controlUrl);
      });
    });
  } else {
    cy.get('#post-authorize').click();
  }

  chooseIdpOnCore(idpId);

  // FI: Authenticate
  cy.url().should('include', Cypress.env('IDP_INTERACTION_URL'));
  cy.get('input[name="login"]').clear().type(login);
  cy.get('input[name="password"]').clear().type(password);

  /**
   * @todo This section should be impplemented in te IDP Mock instance
   */
  //if (eidasLevel) {
  //  cy.get('select[name="acr"]').select(eidasLevel);
  //}
  // --

  cy.get('input[type="submit"]').click();
}

export function basicErrorScenario(params) {
  const { errorCode } = params;
  Reflect.deleteProperty(params, 'errorCode');
  basicScenario({
    ...params,
    login: errorCode,
  });
}

export function getAuthorizeUrl(overrideParams = {}) {
  const baseAuthorizeUrl = '/api/v2/authorize';
  const baseAuthorizeParams = {
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_id: `${Cypress.env('SP1_CLIENT_ID')}`,
    scope: 'openid gender family_name',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    response_type: 'code',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uri: `${Cypress.env('SP1_ROOT_URL')}/oidc-callback/envIssuer`,
    state: 'stateTraces',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    acr_values: 'eidas3',
  };
  const params = {
    ...baseAuthorizeParams,
    ...overrideParams,
  };

  return `${baseAuthorizeUrl}?${QueryString.stringify(params)}`;
}

export function callInteractionByBack(url = '') {
  const [, id] = url.split('/interaction/');
  return `${Cypress.env('FC_INTERACTION_URL')}/${id}`;
}
