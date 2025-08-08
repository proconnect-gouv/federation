import {
  USER_OPERATOR,
  USER_PASS,
} from '../../support/constants';

describe('Identity provider search', () => {
  const BASE_URL = Cypress.config('baseUrl');
  before(() => cy.resetEnv('mongo'));
  beforeEach(() => {
    cy.login(USER_OPERATOR, USER_PASS);
    cy.visit(`/identity-provider`);
  });

  describe('Successful scenarios', () => {
    it('should display a search input', () => {
      cy.get('input[name=search]').should('exist');
      cy.url().should('eq', `${BASE_URL}/identity-provider`);
    });

    it('should display a search result by name', () => {
      cy.formType('input[name=search]', 'fia1');
      cy.get('#searchBtn').click();
      cy.contains('tbody > tr > td', `fia1`);
      cy.url().should('eq', `${BASE_URL}/identity-provider?search=fia1`);
    });

    it('should display every result matching the name', () => {
      cy.formType('input[name=search]', 'fia');
      cy.get('#searchBtn').click();
      cy.contains('tbody > tr > td', `fia1`);
      cy.contains('tbody > tr > td', `fia2`);
      cy.contains('tbody > tr > td', `fia3`);
      cy.url().should('eq', `${BASE_URL}/identity-provider?search=fia`);
    });

    it('should only display result matching the name', () => {
      cy.formType('input[name=search]', 'fia1');
      cy.get('#searchBtn').click();
      cy.contains('tbody > tr > td', `fia1`);
      cy.contains('tbody > tr > td', `fia3`).should('not.exist');
      cy.contains('tbody > tr > td', `fia3`).should('not.exist');
      cy.url().should('eq', `${BASE_URL}/identity-provider?search=fia1`);
    });

    it('should display a search result by client_id', () => {
      cy.formType('input[name=search]', 'myclientidforfia1-low');
      cy.get('#searchBtn').click();
      cy.contains('tbody > tr > td', `fia1`);
      cy.url().should(
        'eq',
        `${BASE_URL}/identity-provider?search=myclientidforfia1-low`,
      );
    });

    it('should only display a search result by client_id', () => {
      cy.formType('input[name=search]', 'myclientidforfia1-low');
      cy.get('#searchBtn').click();
      cy.contains('tbody > tr > td', `fia1`);
      cy.contains('tbody > tr > td', `fia2`).should('not.exist');
      cy.contains('tbody > tr > td', `fia3`).should('not.exist');
      cy.url().should(
        'eq',
        `${BASE_URL}/identity-provider?search=myclientidforfia1-low`,
      );
    });

    it('should display a search result by title', () => {
      cy.formType('input[name=search]', 'FIA1-LOW');
      cy.get('#searchBtn').click();
      cy.contains(
        'tbody > tr > th',
        `Identity Provider 1 - eIDAS faible - ES256`,
      );
      cy.url().should('eq', `${BASE_URL}/identity-provider?search=FIA1-LOW`);
    });

    it('should only display a search result by title', () => {
      cy.formType(
        'input[name=search]',
        'Identity Provider 1 - eIDAS faible - ES256',
      );
      cy.get('#searchBtn').click();
      cy.contains(
        'tbody > tr > th',
        `Identity Provider 1 - eIDAS faible - ES256`,
      );
      cy.contains(
        'tbody > tr > td',
        `FIA1-LOW - eIDAS LOW - NO DISCOVERY - Bêta active`,
      ).should('not.exist');
      cy.contains(
        'tbody > tr > td',
        `FIA2-LOW - eIDAS SUBSTANTIAL - NO DISCOVERY`,
      ).should('not.exist');
      cy.contains(
        'tbody > tr > td',
        `FIA3-LOW - eIDAS HIGH - NO DISCOVERY`,
      ).should('not.exist');
      cy.url().should(
        'eq',
        `${BASE_URL}/identity-provider?search=Identity+Provider+1+-+eIDAS+faible+-+ES256`,
      );
    });
  });

  describe('Failing scenarios', () => {
    it('Should display nothing when no identity provider match the search', () => {
      cy.formType('input[name=search]', 'no-result');
      cy.get('#searchBtn').click();
      cy.contains('tbody > tr > th').should('not.exist');
      cy.url().should('eq', `${BASE_URL}/identity-provider?search=no-result`);
    });
  });
});
