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
    cy.get(`.ministry-panel`).click({ multiple: true });
    // Visibles idps
    cy.get(`button#idp-${idpId}1v2`).should('exist');
    cy.get(`button#idp-${idpId}2v2`).should('exist');
    cy.get(`button#idp-${idpId}-desactive-visible`).should('exist');
    // Invisibles idps
    cy.get(`button#idp-${idpId}-desactive-invisible`).should('not.exist');
    cy.get(`button#idp-${idpId}-active-invisible`).should('not.exist');
  });

  it('should display as disable "not active but visible" IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // Then
    cy.get(`.ministry-panel`).click({ multiple: true });
    // Enabled idps
    cy.get(`button#idp-${idpId}1v2`).should('not.be.disabled');
    cy.get(`button#idp-${idpId}2v2`).should('not.be.disabled');
    // Disabled idps
    cy.get(`button#idp-${idpId}-desactive-visible`).should('be.disabled');
  });

  it('should not do anything when click on disabled IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // When
    cy.get(`.ministry-panel`).click({ multiple: true });
    cy.get(`button#idp-${idpId}-desactive-visible`).click({
      force: true,
    });
    // Then
    cy.url().should('match', mireUrl);
  });

  it('should redirect when click on enabled IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // When
    cy.get(`.ministry-panel`).click({ multiple: true });
    cy.get(`button#idp-${idpId}1v2`).click();
    // Then
    cy.url().should('match', new RegExp(`^https://${idpId}1v2.+$`));
  });

  it('should trigger error 020017 when forging click on disabled IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // When
    cy.get(`.ministry-panel`).click({ multiple: true });
    cy.get(`button#idp-${idpId}-desactive-visible`)
      // Remove the disabled attribute
      .invoke('attr', 'disabled', false)
      .click();
    // Then
    cy.url().should('contain', '/api/v2/redirect-to-idp');

    cy.hasError('Y020017');
  });

  it('should trigger error 020019 when forging click on non existing IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // When
    cy.get(`.ministry-panel`).click({ multiple: true });
    cy.get(`button#idp-${idpNotExist}1v2`).click();
    // Then
    cy.url().should('contain', '/api/v2/redirect-to-idp');
    cy.hasError('Y020019');
  });
});
