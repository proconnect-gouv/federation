import {
  USER_OPERATOR,
  USER_PASS
} from '../../../../shared/cypress/support/constants';

describe('Page not found - error 404', () => {
  const option = {
    method: 'GET',
    url: `/wrong-page`,
    failOnStatusCode: false,
  };

  it('Should display the page not found when we are not connected', () => {
    cy.visit(option);
    cy.url().should('contain', `/wrong-page`);
    cy.contains(USER_OPERATOR).should('not.exist');
    cy.contains('Oops, la page est introuvable...').should('be.visible');

    cy
      .request(option)
      .then((response) => {
        expect(response.status).to.eq(404);
        expect(response.statusText).to.eq('Not Found');
      });
  });

  it('Should display the page not found when we are connected', () => {
    cy.login(USER_OPERATOR, USER_PASS);

    cy.visit(option);
    cy.url().should('contain', `/wrong-page`);
    cy.contains(USER_OPERATOR).should('be.visible');
    cy.get('nav').should('be.visible');
    cy.contains('Oops, la page est introuvable...').should('be.visible');

    cy
      .request(option)
      .then((response) => {
        expect(response.status).to.eq(404);
        expect(response.statusText).to.eq('Not Found');
      });
  });
});
