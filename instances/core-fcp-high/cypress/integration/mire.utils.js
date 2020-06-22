import * as QueryString from 'querystring';

export function basicSuccessScenario(params) {
  const {
    idpId,
    userName,
    sp = Cypress.env('UD1V2_ROOT_URL'),
    method,
  } = params;
  const password = params.password || '123';

  // FS: Click on FC button
  cy.visit(sp);

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
  cy.get(`#idp-${idpId}`).click();

  // FI: Authenticate
  cy.url().should('include', `${Cypress.env('FI_ROOT_URL')}/interaction`);
  cy.get('input[name="login"]').clear().type(userName);
  cy.get('input[name="password"]').clear().type(password);

  cy.get('input[type="submit"]').click();

  // FC: Read confirmation message :D
  cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);

  cy.get('#consent').click();
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
  const { idpId, errorCode, eidasLevel } = params;
  const password = '123';

  // FS: Click on FC button
  cy.visit(`${Cypress.env('UD1V2_ROOT_URL')}`);

  cy.get('img[alt="Se connecter à FranceConnect"]').click();

  // FC: choose FI
  cy.url().should(
    'include',
    `${Cypress.env('FC_ROOT_URL')}/api/v2/interaction`,
  );
  cy.get(`#idp-${idpId}`).click();

  // FI: Authenticate
  cy.url().should('include', `${Cypress.env('FI_ROOT_URL')}/interaction`);
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
    client_id:
      'a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
    scope: 'openid',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    response_type: 'code',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uri: `${Cypress.env(
      'UD1V2_ROOT_URL',
    )}/authentication/login-callback`,
    state: 'stateTraces',
    nonce: 'nonceTraces',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    acr_values: 'eidas3',
  };
  const params = { ...baseAuthorizeParams, ...overrideParams };

  return `${baseAuthorizeUrl}?${QueryString.stringify(params)}`;
}
