
describe('Successful scenarios', () => {
  it('should log in to FS', () => {
    // FS: Fc connect page
    cy.visit(`${Cypress.env('FS_ROOT_URL')}/login`);
    cy.get('input[src="img/FCboutons-10.png"]').click();

    // FC: choose FI
    cy.url().should('match', /\/interaction\/[0-9a-z_-]+/i);
    cy.get('button').click();

    // FC: Back from FI
    cy.url().should('match', /\/interaction\/[0-9a-z_-]+\/consent/i);
    cy.get('button').click();

    // FS: Confirmation page
    cy.url().should('eq', `${Cypress.env('FS_ROOT_URL')}/user`);
  })
});