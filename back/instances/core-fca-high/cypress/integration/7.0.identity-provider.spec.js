import { getAuthorizeUrl } from './mire.utils';

describe('Idp activation & visibility', () => {
  // -- replace by either `fip` or `fia`
  const idpId = `${Cypress.env('IDP_NAME')}`;
  const idpNotExist = `${Cypress.env('IDP_NAME_NOT_EXIST')}`;

  const mireUrl = new RegExp('/interaction/[^/]+');

  it('should display active and visible IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // Then
    cy.get(`#select-ministry`).click();
    cy.get(`#ministry-ministere-de-linterieur`).click();
    cy.get(`#idp-selects`).click();

    // Visibles idps
    cy.get(`#idp-${idpId}1v2`).should('exist');
    cy.get(`#idp-${idpId}2v2`).should('exist');
    cy.get(`#idp-${idpId}-desactive-visible`).should('exist');
    // Invisibles idps
    cy.get(`#idp-${idpId}-desactive-invisible`).should('not.exist');
    cy.get(`#idp-${idpId}-active-invisible`).should('not.exist');
  });

  /**
   * @TODO Implement tests once feature is implemented in core-fca (front + fixture)
   */
  it.skip('should display as disable "not active but visible" IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // Then
    cy.get(`#select-ministry`).click();
    cy.get(`#ministry-ministere-de-linterieur`).click();
    cy.get(`#idp-selects`).click();

    // Enabled idps
    cy.get(`#idp-${idpId}1v2`).should('not.be.disabled');
    cy.get(`#idp-${idpId}2v2`).should('not.be.disabled');
    // Disabled idps
    cy.get(`#idp-${idpId}-desactive-visible`).should('be.disabled');
  });

  /**
   * @TODO Implement tests once feature is implemented in core-fca (front + fixture)
   */
  it.skip('should not do anything when click on disabled IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // When
    cy.get(`#select-ministry`).click();
    cy.get(`#ministry-ministere-de-linterieur`).click();
    cy.get(`#idp-selects`).click();

    cy.get(`#idp-${idpId}-desactive-visible`).click({
      force: true,
    });
    // Then
    cy.url().should('match', mireUrl);
  });

  /**
   * @TODO Implement tests once feature is implemented in core-fca (front + fixture)
   */
  it.skip('should redirect when click on enabled IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // When
    cy.get(`#select-ministry`).click();
    cy.get(`#ministry-ministere-de-linterieur`).click();
    cy.get(`#idp-selects`).click();

    cy.get(`#idp-${idpId}1v2`).click();
    // Then
    cy.url().should('match', new RegExp(`^https://${idpId}1v2.+$`));
  });

  /**
   * @TODO Implement tests once feature is implemented in core-fca (front + fixture)
   */
  it.skip('should trigger error 020017 when forging click on disabled IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // When
    cy.get(`#select-ministry`).click();
    cy.get(`#ministry-ministere-de-linterieur`).click();
    cy.get(`#idp-selects`).click();

    cy.get(`#idp-${idpId}-desactive-visible`)
      // Remove the disabled attribute
      .invoke('attr', 'disabled', false)
      .click();
    // Then
    cy.url().should('contain', '/api/v2/redirect-to-idp');

    cy.hasError('Y020017');
  });

  /**
   * @TODO Implement tests once feature is implemented in core-fca (front + fixture)
   */
  it.skip('should trigger error 020019 when forging click on non existing IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // When
    cy.get(`#select-ministry`).click();
    cy.get(`#ministry-ministere-de-linterieur`).click();
    cy.get(`#idp-selects`).click();

    cy.get(`#idp-${idpNotExist}1v2`).click();
    // Then
    cy.url().should('contain', '/api/v2/redirect-to-idp');
    cy.hasError('Y020019');
  });
});
