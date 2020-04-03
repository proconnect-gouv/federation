function basicScenario(params) {
  const { checkString, idpId, userName } = params;
  const password = params.password || '123';

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
    .type(userName);
  cy.get('input[name="password"]')
    .clear()
    .type(password);

  cy.get('input[type="submit"]').click();

  // FC: Read confirmation message :D
  cy.url().should('match', /\/interaction\/[0-9a-z_-]+\/consent/i);

  cy.get('#consent').click();

  // FS: Read data
  cy.contains(checkString);
}

describe('Successful scenarios', () => {
  it('should log in to User Dashboard', () => {
    basicScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'test',
      checkString: 'Angela Claire Louise'
    });
  });
});
