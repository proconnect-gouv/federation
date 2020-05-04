function basicErrorScenario(params) {
  const { idpId, errorCode } = params;
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

  cy.get('input[type="submit"]').click();
}

function checkError(errorCode) {
  cy.url().should('match', new RegExp(`\/interaction\/.*\/consent`));
  cy.get('h1').contains('🚨 Erreur 😓 !');
  cy.get('pre').contains(`code : ${errorCode}`);
}

describe('Error scenarios', () => {
  it('should trigger error Y030110 (session not found)', () => {
    basicErrorScenario({
      errorCode: 'test',
      eidasLevel: 1,
      idpId: 'test',
    });

    cy.clearCookies();

    cy.get('#consent').click();

    cy.url().should('match', new RegExp(`\/interaction\/.*\/login`));
    cy.get('h1').contains('🚨 Erreur 😓 !');
    cy.get('pre').contains('code : Y030110');
  });
  it('should trigger error Y180001 (user blocked)', () => {
    basicErrorScenario({
      errorCode: 'E000001',
      eidasLevel: 1,
      idpId: 'test',
    });

    cy.url().should('match', new RegExp(`\/interaction\/.*\/consent`));
    cy.get('h1').contains('🚨 Erreur 😓 !');
    cy.get('pre').contains('code : Y180001');
  });

  it('should trigger error Y010004', () => {
    basicErrorScenario({
      errorCode: 'E010004',
      eidasLevel: 1,
      idpId: 'test',
    });

    checkError('Y010004');
  });

  it('should trigger error Y010006', () => {
    basicErrorScenario({
      errorCode: 'E010006',
      eidasLevel: 1,
      idpId: 'test',
    });

    checkError('Y010006');
  });

  it('should trigger error Y010007', () => {
    basicErrorScenario({
      errorCode: 'E010007',
      eidasLevel: 1,
      idpId: 'test',
    });

    checkError('Y010007');
  });

  it('should trigger error Y010008', () => {
    basicErrorScenario({
      errorCode: 'E010008',
      eidasLevel: 1,
      idpId: 'test',
    });

    checkError('Y010008');
  });

  it('should trigger error Y010009', () => {
    basicErrorScenario({
      errorCode: 'E010009',
      eidasLevel: 1,
      idpId: 'test',
    });

    checkError('Y010009');
  });

  it('should trigger error Y010011', () => {
    basicErrorScenario({
      errorCode: 'E010011',
      eidasLevel: 1,
      idpId: 'test',
    });

    checkError('Y010011');
  });

  it('should trigger error Y010012', () => {
    basicErrorScenario({
      errorCode: 'E010012',
      eidasLevel: 1,
      idpId: 'test',
    });

    checkError('Y010012');
  });

  it('should trigger error Y010013', () => {
    basicErrorScenario({
      errorCode: 'E010013',
      eidasLevel: 1,
      idpId: 'test',
    });

    checkError('Y010013');
  });

  it('should trigger error Y010015', () => {
    basicErrorScenario({
      errorCode: 'E010015',
      eidasLevel: 1,
      idpId: 'test',
    });

    checkError('Y010015');
  });
});
