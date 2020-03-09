function basicScenario(params) {
  const { idpId, userName, eidasLevel } = params;
  const password = params.password || '123';

  // FS: Click on FC button
  cy.visit(`${Cypress.env('FS_ROOT_URL')}/login`);
  cy.contains('Connexion');
  if (eidasLevel) {
    cy.get('select[name="eidasLevel"]').select(`eidas${eidasLevel}`);
  }

  cy.get('input[src="img/FCboutons-10.png"]').click();

  // FC: choose FI
  cy.url().should('include', `${Cypress.env('FC_ROOT_URL')}/interaction`);
  cy.get(`#idp-${idpId}`).click();

  // FI: Authenticate
  cy.url().should('include', `${Cypress.env('FI_ROOT_URL')}/interaction`);
  cy.get('input[name="login"]')
    .clear()
    .type(userName);
  cy.get('input[name="password"]')
    .clear()
    .type(password);
  if (eidasLevel) {
    cy.get('select[name="acr"]').select(`eidas${eidasLevel}`);
  }

  cy.get('input[type="submit"]').click();

  // FC: Read confirmation message :D
  cy.url().should('match', /\/interaction\/[0-9a-z_-]+\/consent/i);

  cy.get('#consent').click();

  // FS: Read data
  cy.url().should('equal', `${Cypress.env('FS_ROOT_URL')}/user`);
  cy.contains('"given_name": "Angela Claire Louise"');
}

describe('Successful scenarios', () => {
  it('should log in to FS', () => {
    basicScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'test',
    });
  });
});
