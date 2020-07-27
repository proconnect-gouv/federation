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
  const {
    idpId,
    userName,
    sp = 'SP1',
    method
  } = params;
  const password = params.password || '123';

  const serviceProvider = {
    url: Cypress.env(`${sp}_ROOT_URL`),
    id: Cypress.env(`${sp}_CLIENT_ID`),
  };

  // FS: Click on FC button
  cy.visit(serviceProvider.url);

  if (method === 'POST') {
    cy.get('#connect-POST').click();
  } else {
    cy.get('#connect-GET').click();
  }

  // FC: choose FI

  cy.url().should(
    'include',
    `${Cypress.env('FC_ROOT_URL')}/api/v2/interaction`,
  );

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FCP_AUTHORIZE_INITIATED',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId: null,
    idpName: null,
    idpAcr: null,
  });
  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FCP_SHOWED_IDP_CHOICE',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId: null,
    idpName: null,
    idpAcr: null,
  });
  cy.get(`#idp-${idpId}`).click();

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

  // FC: Read confirmation message :D
  cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FCP_REQUESTED_IDP_TOKEN',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId, // idpId is now set
    idpAcr: null, // idpAcr is still null
  });

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FCP_REQUESTED_IDP_USERINFO',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId,
    idpAcr: null, // idpAcr is still null
  });

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FCP_REQUESTED_RNIPP',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values, // idpAcr is set
  });

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FCP_RECEIVED_VALID_RNIPP',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values,
  });

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FCP_VERIFIED',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values,
  });

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FCP_SHOWED_CONSENT',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values,
  });

  cy.get('#consent').click();

  cy.hasBusinessLog({
    category: 'FRONT_CINEMATIC',
    event: 'FCP_REDIRECTED_TO_SP',
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values,
  });

  cy.hasBusinessLog({
    category: 'BACK_CINEMATIC',
    event: 'FS_REQUESTED_FCP_TOKEN', // @TODO Replace "FS_" by "SP_"
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values,
  });

  cy.hasBusinessLog({
    category: 'BACK_CINEMATIC',
    event: 'FS_REQUESTED_FCP_USERINFO', // @TODO Replace "FS_" by "SP_"
    spId: serviceProvider.id,
    spAcr: params.acr_values,
    idpId,
    idpAcr: params.acr_values,
  });
}

export function checkInformations(identity) {
  const {
    gender,
    givenName,
    familyName,
    preferredUsername = '/',
    birthdate,
    birthplace,
    birthcountry,
  } = identity;

  cy.contains(`Civilité : ${gender}`);
  cy.contains(`Prénom(s) : ${givenName}`);
  cy.contains(`Nom(s) : ${familyName}`);
  cy.contains(`Nom d'usage : ${preferredUsername}`);
  cy.contains(`Date de naissance : ${birthdate}`);

  if (birthplace) {
    cy.contains(`COG (lieu de naissance) : ${birthplace}`);
  }

  if (birthcountry) {
    cy.contains(`COG (Pays de naissance) : ${birthcountry}`);
  }
}

export function basicErrorScenario(params) {
  const {
    idpId,
    errorCode,
    eidasLevel
  } = params;
  const password = '123';

  // FS: Click on FC button
  cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

  cy.get('img[alt="Se connecter à FranceConnect"]').click();

  // FC: choose FI
  cy.url().should(
    'include',
    `${Cypress.env('FC_ROOT_URL')}/api/v2/interaction`,
  );
  cy.get(`#idp-${idpId}`).click();

  // FI: Authenticate
  cy.url().should('include', Cypress.env('IDP_INTERACTION_URL'));
  cy.get('input[name="login"]').clear().type(errorCode);
  cy.get('input[name="password"]').clear().type(password);

  if (eidasLevel) {
    cy.get('select[name="acr"]').select(eidasLevel);
  }

  cy.get('input[type="submit"]').click();
}

export function getAuthorizeUrl(overrideParams = {}) {
  const baseAuthorizeUrl = '/api/v2/authorize';
  const baseAuthorizeParams = {
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_id: `${Cypress.env('SP1_CLIENT_ID')}`,
    scope: 'openid',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    response_type: 'code',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uri: `${Cypress.env('SP1_ROOT_URL')}/login-callback`,
    state: 'stateTraces',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    acr_values: 'eidas3',
  };
  const params = {
    ...baseAuthorizeParams,
    ...overrideParams
  };

  return `${baseAuthorizeUrl}?${QueryString.stringify(params)}`;
}
