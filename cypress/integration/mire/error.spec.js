function basicErrorScenario(params) {
  const { idpId, errorCode, eidasLevel } = params;
  const password = '123';

  // FS: Click on FC button
  cy.visit(`${Cypress.env('UD_ROOT_URL')}`);

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

function checkError(errorCode) {
  cy.url().should('match', new RegExp(`\/interaction\/.*\/consent`));
  cy.get('h1').contains('🚨 Erreur 😓 !');
  cy.get('pre').contains(`code : ${errorCode}`);
}

describe('Error scenarios', () => {
  describe('Acr', () => {
    it('should trigger error Y000400 (HTTP 400) when acr from SP is not supported', () => {
      const baseUrl =
        '/api/v2/authorize?client_id=a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc&scope=openid&response_type=code&redirect_uri=https%3A%2F%2Fudv2.docker.dev-franceconnect.fr%2Fauthentication%2Flogin-callback&state=stateTraces&nonce=nonceTraces&acr_values=';

      // Control visit
      cy.visit(`${baseUrl}eidas2`);
      cy.get('#idp-fip1v2');

      // Real test
      cy.visit(`${baseUrl}NonSupportedAcr`, { failOnStatusCode: false });
      cy.get('h1').contains('🚨 Erreur 😓 !');
      cy.get('pre').contains('code : Y000400');
    });

    it('should trigger error Y020001 when acr from IdP is lower than asked', () => {
      basicErrorScenario({
        errorCode: 'test',
        idpId: 'fip1v2',
        eidasLevel: 'eidas1',
      });

      cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/consent`));
      cy.get('h1').contains('🚨 Erreur 😓 !');
      cy.get('pre').contains('code : Y020001');
    });
  });

  describe('Session', () => {
    it('should trigger error Y030110 (session not found)', () => {
      basicErrorScenario({
        errorCode: 'test',
        idpId: 'fip1v2',
      });

      cy.clearCookies();

      cy.get('#consent').click();

      cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/login`));
      cy.get('h1').contains('🚨 Erreur 😓 !');
      cy.get('pre').contains('code : Y030110');
    });
  });

  describe('Account', () => {
    // waiting merge database infra
    it.skip('should trigger error Y180001 (user blocked)', () => {
      basicErrorScenario({
        errorCode: 'E000001',
        idpId: 'fip1v2',
      });

      cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/consent`));
      cy.get('h1').contains('🚨 Erreur 😓 !');
      cy.get('pre').contains('code : Y180001');
    });
  });

  describe('RNIPP', () => {
    it('should trigger error Y010004', () => {
      basicErrorScenario({
        errorCode: 'E010004',
        idpId: 'fip1v2',
      });

      checkError('Y010004');
    });

    it('should trigger error Y010006', () => {
      basicErrorScenario({
        errorCode: 'E010006',
        idpId: 'fip1v2',
      });

      checkError('Y010006');
    });

    it('should trigger error Y010007', () => {
      basicErrorScenario({
        errorCode: 'E010007',
        idpId: 'fip1v2',
      });

      checkError('Y010007');
    });

    it('should trigger error Y010008', () => {
      basicErrorScenario({
        errorCode: 'E010008',
        idpId: 'fip1v2',
      });

      checkError('Y010008');
    });

    it('should trigger error Y010009', () => {
      basicErrorScenario({
        errorCode: 'E010009',
        idpId: 'fip1v2',
      });

      checkError('Y010009');
    });

    it('should trigger error Y010011', () => {
      basicErrorScenario({
        errorCode: 'E010011',
        idpId: 'fip1v2',
      });

      checkError('Y010011');
    });

    it('should trigger error Y010012', () => {
      basicErrorScenario({
        errorCode: 'E010012',
        idpId: 'fip1v2',
      });

      checkError('Y010012');
    });

    it('should trigger error Y010013', () => {
      basicErrorScenario({
        errorCode: 'E010013',
        idpId: 'fip1v2',
      });

      checkError('Y010013');
    });

    it('should trigger error Y010015', () => {
      basicErrorScenario({
        errorCode: 'E010015',
        idpId: 'fip1v2',
      });

      checkError('Y010015');
    });
  });
});
