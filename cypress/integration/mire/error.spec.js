import * as QueryString from 'querystring';

function basicErrorScenario(params) {
  const { idpId, errorCode, eidasLevel } = params;
  const password = '123';

  // FS: Click on FC button
  cy.visit(`${Cypress.env('UD2_ROOT_URL')}`);

  cy.get('img[alt="Se connecter à FranceConnect"]').click();

  // FC: choose FI
  cy.url().should('include', `${Cypress.env('FC_ROOT_URL')}/interaction`);
  cy.get(`#idp-${idpId}`).click();

  // FI: Authenticate
  cy.url().should('include', `${Cypress.env('FI_ROOT_URL')}/interaction`);
  cy.get('input[name="login"]')
    .clear()
    .type(errorCode);
  cy.get('input[name="password"]')
    .clear()
    .type(password);

  if (eidasLevel) {
    cy.get('select[name="acr"]').select(eidasLevel);
  }

  cy.get('input[type="submit"]').click();
}

function getAuthorizeUrl(overrideParams = {}) {
  const baseAuthorizeUrl = '/api/v2/authorize';
  const baseAuthorizeParams = {
    // oidc param
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_id:
      'a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
    scope: 'openid',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/camelcase
    response_type: 'code',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/camelcase
    redirect_uri:
      'https://udv2.docker.dev-franceconnect.fr/authentication/login-callback',
    state: 'stateTraces',
    nonce: 'nonceTraces',
    // oidc param
    // eslint-disable-next-line @typescript-eslint/camelcase
    acr_values: 'eidas3',
  };
  const params = { ...baseAuthorizeParams, ...overrideParams };

  return `${baseAuthorizeUrl}?${QueryString.stringify(params)}`;
}

describe('Error scenarios', () => {
  describe('Service Provider', () => {
    it('should trigger error Y030106 if SP is not in database', () => {
      // oidc param
      // eslint-disable-next-line @typescript-eslint/camelcase
      const url = getAuthorizeUrl({ client_id: 'random-bad-client-id' });
      cy.visit(url, { failOnStatusCode: false });

      cy.hasError('Y030106');
    });

    it('should trigger error Y030106 if SP is in database but disabled', () => {
      const url = getAuthorizeUrl({
        // oidc param
        // eslint-disable-next-line @typescript-eslint/camelcase
        client_id:
          '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
      });
      cy.visit(url, { failOnStatusCode: false });

      cy.hasError('Y030106');
    });

    it('should trigger error Y030118 if the parameter redirect_uri does NOT match one of the redirect uris of the SP in database', () => {
      const url = getAuthorizeUrl({
        // oidc param
        // eslint-disable-next-line @typescript-eslint/camelcase
        redirect_uri: 'https://my-malicious-url.fr/callback',
      });
      cy.visit(url, { failOnStatusCode: false });

      cy.hasError('Y030118');
    });
  });

  describe('prompt', () => {
    it('should not allow prompt=none', () => {
      const url = getAuthorizeUrl({ prompt: 'none' });
      cy.visit(url, { failOnStatusCode: false });
      cy.hasError('Y000400');
    });
    it('should not allow prompt=select_account', () => {
      const url = getAuthorizeUrl({ prompt: 'select_account' });
      cy.visit(url, { failOnStatusCode: false });
      cy.hasError('Y000400');
    });
    it('should allow prompt=login', () => {
      const url = getAuthorizeUrl({ prompt: 'login' });
      cy.visit(url, { failOnStatusCode: false });
      cy.get('#idp-list').should('exist');
    });
    it('should allow prompt=consent', () => {
      const url = getAuthorizeUrl({ prompt: 'consent' });
      cy.visit(url, { failOnStatusCode: false });
      cy.get('#idp-list').should('exist');
    });
    it('should allow prompt=login consent', () => {
      const url = getAuthorizeUrl({ prompt: 'login consent' });
      cy.visit(url, { failOnStatusCode: false });
      cy.get('#idp-list').should('exist');
    });
    it('should allow prompt=consent login', () => {
      const url = getAuthorizeUrl({ prompt: 'consent login' });
      cy.visit(url, { failOnStatusCode: false });
      cy.get('#idp-list').should('exist');
    });
  });

  describe('Acr', () => {
    it('should trigger error Y000400 (HTTP 400) when acr from SP is not supported', () => {
      // Control visit
      const controlUrl = getAuthorizeUrl();
      cy.visit(controlUrl);
      cy.get('#idp-fip1v2').should('exist');

      // Real test
      // oidc param
      // eslint-disable-next-line @typescript-eslint/camelcase
      const testUrl = getAuthorizeUrl({ acr_values: 'NonSupportedAcr' });
      cy.visit(testUrl, { failOnStatusCode: false });
      cy.hasError('Y000400');
    });

    it('should trigger error Y020001 when acr from IdP is lower than asked', () => {
      basicErrorScenario({
        errorCode: 'test',
        idpId: 'fip1v2',
        eidasLevel: 'eidas1',
      });

      cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/verify`));
      cy.hasError('Y020001');
    });
  });

  describe('Session', () => {
    it('should trigger error Y150003 (session not found)', () => {
      basicErrorScenario({
        errorCode: 'test',
        idpId: 'fip1v2',
      });

      cy.clearCookies();

      cy.get('#consent').click();

      cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/login`));
      cy.hasError('Y150003');
    });

    it('should trigger error Y150003 if FC session cookie not set', () => {
      const authorizeUrl = getAuthorizeUrl();
      cy.visit(authorizeUrl);
      cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));

      cy.url().then(interactionUrl => {
        cy.clearCookie('fc_session_id');
        cy.visit(interactionUrl, { failOnStatusCode: false });
        cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));
        cy.hasError('Y150003');
      });
    });

    it('should trigger error Y150004 if FC interaction cookie not set', () => {
      const authorizeUrl = getAuthorizeUrl();
      cy.visit(authorizeUrl);
      cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));

      cy.url().then(interactionUrl => {
        cy.clearCookie('fc_interaction_id');
        cy.visit(interactionUrl, { failOnStatusCode: false });
        cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));
        cy.hasError('Y150004');
      });
    });

    it('should trigger error Y150001 if FC interaction cookie does not match any backend interaction', () => {
      const authorizeUrl = getAuthorizeUrl();
      cy.visit(authorizeUrl);
      cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));

      cy.url().then(interactionUrl => {
        /**
         * Forged cookie
         * We override cookie while keeping signature...
         *
         * We have to get existing cookie and edit its value,
         * otherwise it is not reconnized as a signed cookie
         * and we get an error Y150004 which is not what we want to test here.
         */
        cy.getCookie('fc_interaction_id').then(cookie => {
          cy.setCookie(
            'fc_interaction_id',
            // Replace the begining of the cookie by arbitratry value
            cookie.value.replace(/^s%3A(.){4}/, 's%3Arofl'),
            {
              httpOnly: true,
              secure: true,
              sameSite: 'Strict',
              domain: Cypress.env('APP_DOMAIN'),
            },
          );
          cy.visit(interactionUrl, { failOnStatusCode: false });
          cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));
          cy.hasError('Y150001');
        });
      });
    });

    it('should trigger error Y150005 if FC session cookie does not match found backend interaction', () => {
      const authorizeUrl = getAuthorizeUrl();
      cy.visit(authorizeUrl);
      cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));

      cy.url().then(interactionUrl => {
        /**
         * Forged cookie
         * We override cookie while keeping signature...
         *
         * We have to get existing cookie and edit its value,
         * otherwise it is not reconnized as a signed cookie
         * and we get an error Y150004 which is not what we want to test here.
         */
        cy.getCookie('fc_session_id').then(cookie => {
          cy.setCookie(
            'fc_session_id',
            // Replace the begining of the cookie by arbitratry value
            cookie.value.replace(/^s%3A(.){4}/, 's%3Arofl'),
            {
              httpOnly: true,
              secure: true,
              sameSite: 'Strict',
              domain: Cypress.env('APP_DOMAIN'),
            },
          );
          cy.visit(interactionUrl, { failOnStatusCode: false });
          cy.url().should('match', new RegExp(`\/interaction\/[^/]+$`));
          cy.hasError('Y150005');
        });
      });
    });
  });

  describe('Account', () => {
    // waiting merge database infra
    it('should trigger error Y180001 (user blocked)', () => {
      basicErrorScenario({
        errorCode: 'E000001',
        idpId: 'fip1v2',
      });

      cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/verify`));
      cy.hasError('Y180001');
    });
  });

  describe('RNIPP', () => {
    it('should trigger error Y010004', () => {
      basicErrorScenario({
        errorCode: 'E010004',
        idpId: 'fip1v2',
      });

      cy.hasError('Y010004');
    });

    it('should trigger error Y010006', () => {
      basicErrorScenario({
        errorCode: 'E010006',
        idpId: 'fip1v2',
      });

      cy.hasError('Y010006');
    });

    it('should trigger error Y010007', () => {
      basicErrorScenario({
        errorCode: 'E010007',
        idpId: 'fip1v2',
      });

      cy.hasError('Y010007');
    });

    it('should trigger error Y010008', () => {
      basicErrorScenario({
        errorCode: 'E010008',
        idpId: 'fip1v2',
      });

      cy.hasError('Y010008');
    });

    it('should trigger error Y010009', () => {
      basicErrorScenario({
        errorCode: 'E010009',
        idpId: 'fip1v2',
      });

      cy.hasError('Y010009');
    });

    it('should trigger error Y010011', () => {
      basicErrorScenario({
        errorCode: 'E010011',
        idpId: 'fip1v2',
      });

      cy.hasError('Y010011');
    });

    it('should trigger error Y010012', () => {
      basicErrorScenario({
        errorCode: 'E010012',
        idpId: 'fip1v2',
      });

      cy.hasError('Y010012');
    });

    it('should trigger error Y010013', () => {
      basicErrorScenario({
        errorCode: 'E010013',
        idpId: 'fip1v2',
      });

      cy.hasError('Y010013');
    });

    it('should trigger error Y010015', () => {
      basicErrorScenario({
        errorCode: 'E010015',
        idpId: 'fip1v2',
      });

      cy.hasError('Y010015');
    });
  });

  describe('Scope', () => {
    it('should return to the SP with an "invalid_scope" error if the query contains scopes that are not whitelisted for this SP', () => {
      // oidc param
      // eslint-disable-next-line @typescript-eslint/camelcase
      const url = getAuthorizeUrl({
        scope: 'openid profile',
      });

      cy.visit(url, { failOnStatusCode: false });

      cy.url().should(
        'match',
        new RegExp(
          'https://udv2.docker.dev-franceconnect.fr/authentication/error',
        ),
      );

      cy.get('#error-title').contains('invalid_scope');
      cy.get('#error-description').contains(
        'requested scope is not whitelisted',
      );
    });
  });
});
