import * as QueryString from 'querystring';

export function beforeSuccessScenario(params) {
  const { sp = 'fsa1v2', method } = params;

  const { SP_ROOT_URL, SP_CLIENT_ID } = getServiceProvider(sp);
  // FS: Click on FC button
  cy.visit(SP_ROOT_URL);

  cy.clearBusinessLog();

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
    spId: SP_CLIENT_ID,
    spAcr: params.acr_values,
    idpId: null,
    idpName: null,
    idpAcr: null,
  });
  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FC_SHOWED_IDP_CHOICE',
    spId: SP_CLIENT_ID,
    spAcr: params.acr_values,
    idpId: null,
    idpName: null,
    idpAcr: null,
  });
}

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
export function basicSuccessScenario(idpId) {
  chooseIdpOnCore(idpId);
}

export function afterSuccessScenario(params) {
  const { sp = 'fsa1v2', idpId, userName } = params;
  const password = params.password || '123';
  const { SP_CLIENT_ID } = getServiceProvider(sp);
  const { IDP_INTERACTION_URL } = getIdentityProvider(idpId);
  // FI: Authenticate
  cy.url().should('include', IDP_INTERACTION_URL);

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'IDP_CHOSEN',
    spId: SP_CLIENT_ID,
    spAcr: params.acr_values,
    idpId, // idpId is set
    idpAcr: null, // idpAct is still null
  });

  cy.get('input[name="login"]').clear().type(userName);
  cy.get('input[name="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FC_REQUESTED_IDP_TOKEN',
    spId: SP_CLIENT_ID,
    spAcr: params.acr_values,
    idpId, // idpId is now set
    idpAcr: null, // idpAcr is still null
  });

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FC_REQUESTED_IDP_USERINFO',
    spId: SP_CLIENT_ID,
    spAcr: params.acr_values,
    idpId,
    idpAcr: null, // idpAcr is still null
  });

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FC_REDIRECTED_TO_SP',
    spId: SP_CLIENT_ID,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values,
  });

  cy.hasBusinessLog({
    category: 'BACK_CINEMATIC',
    event: 'SP_REQUESTED_FC_TOKEN',
    spId: SP_CLIENT_ID,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values,
  });

  cy.hasBusinessLog({
    category: 'BACK_CINEMATIC',
    event: 'SP_REQUESTED_FC_USERINFO',
    spId: SP_CLIENT_ID,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values,
  });
}

export function checkInformations(identity) {
  const { givenName, usualName } = identity;

  checkInStringifiedJson('given_name', givenName);
  checkInStringifiedJson('usual_name', usualName);
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
  const { ID, MINISTRY_NAME } = getIdentityProvider(idpId);
  cy.url().should(
    'include',
    `${Cypress.env('FC_ROOT_URL')}/api/v2/interaction`,
  );
  cy.get('#fi-search-term').type(MINISTRY_NAME);
  cy.get(`#idp-${ID}-button`).click();
}

export function basicScenario(params) {
  const {
    idpId,
    login = 'test',
    // eidasLevel, see comment below
    sp = 'fsa1v2',
    overrideParams,
  } = params;
  const password = '123';
  const { IDP_INTERACTION_URL } = getIdentityProvider(idpId);
  const { SP_ROOT_URL } = getServiceProvider(sp);
  cy.visit(SP_ROOT_URL);

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
  cy.url().should('include', IDP_INTERACTION_URL);
  cy.get('input[name="login"]').clear().type(login);
  cy.get('input[name="password"]').clear().type(password);

  /**
   * @todo #422 This section should be impplemented in te IDP Mock instance
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/422
   */
  //if (eidasLevel) {
  //  cy.get('select[name="acr"]').select(eidasLevel);
  //}
  // --

  cy.get('button[type="submit"]').click();
}

export function basicErrorScenario(params) {
  const { errorCode } = params;
  Reflect.deleteProperty(params, 'errorCode');
  basicScenario({
    ...params,
    login: errorCode,
  });
}

export function getAuthorizeUrl(overrideParams = {}, removeParams = []) {
  const { SP_CLIENT_ID, SP_ROOT_URL } = getServiceProvider('fsa1v2');
  const baseAuthorizeUrl = '/api/v2/authorize';
  const baseAuthorizeParams = {
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_id: `${SP_CLIENT_ID}`,
    scope: 'openid gender family_name',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    response_type: 'code',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uri: `${SP_ROOT_URL}/oidc-callback/envIssuer`,
    state: 'stateTraces',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    acr_values: 'eidas3',
    nonce: 'nonceThatRespectsTheLengthWhichIsDefinedInTheDTOForKinematicWork',
  };
  const params = {
    ...baseAuthorizeParams,
    ...overrideParams,
  };

  if (removeParams) {
    const paramsToKill = Array.isArray(removeParams)
      ? removeParams
      : [removeParams];
    paramsToKill.forEach((deadParam) =>
      Reflect.deleteProperty(params, deadParam),
    );
  }

  return `${baseAuthorizeUrl}?${QueryString.stringify(params)}`;
}

/**
 * Retrieve service provider information
 * @param {*} sp : service provider identifier
 */
export function getServiceProvider(sp = 'fsa1v2') {
  return Cypress.env('SP_AVAILABLES').find(({ ID }) => ID === sp);
}

/**
 * Retrieve service provider information
 * @param {*} idp : identity provider uid
 */
export function getIdentityProvider(idp = 'fia1v2') {
  return Cypress.env('IDP_AVAILABLES').find(({ ID }) => ID === idp);
}
