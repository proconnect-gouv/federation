import { getAuthorizeUrl } from './mire.utils';

describe('Idp activation & visibility', () => {
  // -- replace by either `fip` or `fia`
  const idpId = `${Cypress.env('IDP_NAME')}`;
  const idpNotExist = `${Cypress.env('IDP_NAME_NOT_EXIST')}`;
  const ministryId = 'ministry1';

  const mireUrl = new RegExp('/interaction/[^/]+');

  it('should display active and visible IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // Then
    cy.get(`#select-ministry`).click();
    cy.get(`#ministry-${ministryId}`).click();
    cy.get(`#idp-selects`).click();

    // Visibles idps
    cy.get(`#idp-${idpId}1v2`).should('exist');
    cy.get(`#idp-${idpId}2v2`).should('exist');
    cy.get(`#idp-${idpId}-desactive-visible`).should('exist');
    // Invisibles idps
    cy.get(`#idp-${idpId}-desactive-invisible`).should('not.exist');
    cy.get(`#idp-${idpId}-active-invisible`).should('not.exist');
  });

  it('should find an existing idp, case insensitive, with space, with accent', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);

    cy.get('#fi-search-term').type('provider 1 élevé');

    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia1v2"]',
    ).should('exist');
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia2v2"]',
    ).should('not.exist');

    cy.contains('Identity Provider 1 - eIDAS élevé').click();
    cy.url().should('include', Cypress.env('IDP_INTERACTION_URL'));
  });

  it('should find an existing idp, case insensitive, without space', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);

    cy.get('#fi-search-term').type('provider1 ele');

    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia1v2"]',
    ).should('exist');
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia2v2"]',
    ).should('not.exist');

    cy.contains('Identity Provider 1 - eIDAS élevé').click();
    cy.url().should('include', Cypress.env('IDP_INTERACTION_URL'));
  });

  it('should find an existing idp, case insensitive, without accent', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);

    cy.get('#fi-search-term').type('provider 1 eleve');

    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia1v2"]',
    ).should('exist');
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia2v2"]',
    ).should('not.exist');

    cy.contains('Identity Provider 1 - eIDAS élevé').click();
    cy.url().should('include', Cypress.env('IDP_INTERACTION_URL'));
  });

  it('should display an error message if no idp matches search', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);

    cy.get('#fi-search-term').type('I do not exist');

    cy.get('#identity-provider-search input[name="providerUid"]').should(
      'not.exist',
    );

    cy.contains("Aucun fournisseur d'identités n'a été trouvé").should(
      'be.visible',
    );
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
    cy.get(`#ministry-${ministryId}`).click();
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
    cy.get(`#ministry-${ministryId}`).click();
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
    cy.get(`#ministry-${ministryId}`).click();
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
    cy.get(`#ministry-${ministryId}`).click();
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
    cy.get(`#ministry-${ministryId}`).click();
    cy.get(`#idp-selects`).click();

    cy.get(`#idp-${idpNotExist}1v2`).click();
    // Then
    cy.url().should('contain', '/api/v2/redirect-to-idp');
    cy.hasError('Y020019');
  });
});
