import {
  USER_ONLY_ADMIN,
  USER_PASS,
} from '../../../../shared/cypress/support/constants';

describe('Forbidden - error 403', () => {
  const option = {
    method: 'GET',
    url: `${Cypress.env('APP_FORBIDDEN_PAGE')}`,
    failOnStatusCode: false,
  };

  it('Should not possible to see content if we are not right roles', () => {
    cy.forceLogin(USER_ONLY_ADMIN, USER_PASS);

    cy.visit(option);
    cy.url().should('eq', `${Cypress.env('APP_FORBIDDEN_PAGE')}`);
    cy.contains(USER_ONLY_ADMIN).should('be.visible');
    cy.get('nav').should('be.visible');
    cy.contains('Accès refusé').should('be.visible');

    cy.request(option).then(response => {
      expect(response.status).to.eq(403);
      expect(response.statusText).to.eq('Forbidden');
    });

    cy.logout(USER_ONLY_ADMIN);
  });
});
