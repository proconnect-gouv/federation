describe('Unauthorized - error 401', () => {
  it('Should redirect on the login page if we are not connected', () => {
    cy.visit(``);
    cy.url().should('contain', `/login`);
    cy.get('form').should('be.visible');
  });
});
