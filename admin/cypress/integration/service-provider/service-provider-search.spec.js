import { USER_OPERATOR, USER_PASS } from '../../support/constants';

describe('Service provider search', () => {
  const BASE_URL = Cypress.config('baseUrl');
  before(() => cy.resetEnv('mongo'));
  beforeEach(() => {
    cy.login(USER_OPERATOR, USER_PASS);
  });

  describe('Successful scenarios', () => {
    it('Should display a search input and a reset button', () => {
      cy.get('input[name=search]').should('be.visible');
      cy.url().should('eq', `${BASE_URL}/service-provider`);
    });

    it('Should display a search result by name', () => {
      cy.formType('input[name=search]', 'FSA1');
      cy.get('#searchBtn').click();
      cy.contains('tbody > tr > th', `FSA - FSA1-LOW`);
      cy.get('tbody')
        .find('tr')
        .should('have.length', 1);
      cy.url().should('eq', `${BASE_URL}/service-provider?search=FSA1`);
    });

    it('Should display a search result by name not case sensitive', () => {
      cy.formType('input[name=search]', 'fsa1');
      cy.get('#searchBtn').click();
      cy.contains('tbody > tr > th', `FSA - FSA1-LOW`);
      cy.get('tbody')
        .find('tr')
        .should('have.length', 1);
      cy.url().should('eq', `${BASE_URL}/service-provider?search=fsa1`);
    });

    it('Should display a search result by client_id', () => {
      cy.formType(
        'input[name=search]',
        '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
      );
      cy.get('#searchBtn').click();
      cy.contains('tbody > tr > th', `FSA - FSA1-LOW`);
      cy.url().should(
        'eq',
        `${BASE_URL}/service-provider?search=6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950`,
      );
    });

    it('Should display a search result by client_id not case sensitive', () => {
      cy.formType(
        'input[name=search]',
        '6925FB8143C76EDED44D32B40C0CB1006065F7F003DE52712B78985704F39950',
      );
      cy.get('#searchBtn').click();
      cy.contains('tbody > tr > th', `FSA - FSA1-LOW`);
      cy.get('tbody')
        .find('tr')
        .should('have.length', 1);
      cy.url().should(
        'eq',
        `${BASE_URL}/service-provider?search=6925FB8143C76EDED44D32B40C0CB1006065F7F003DE52712B78985704F39950`,
      );
    });
  });

  describe('Failing scenarios', () => {
    it('Should display nothing when no service provider match the search', () => {
      cy.formType('input[name=search]', 'Myzox');
      cy.contains('tbody > tr > th').should('not.exist');
      cy.url().should('eq', `${BASE_URL}/service-provider`);
    });
  });
});
