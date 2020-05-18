describe('Idp activation & visibiliy', () => {
  /**
   * Mire base URL, no need to go though a SP
   * for thoses tests
   */
  const authorizeUrl =
    '/api/v2/authorize?' +
    [
      'client_id=a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
      'scope=openid',
      'response_type=code',
      'redirect_uri=https%3A%2F%2Fudv2.docker.dev-franceconnect.fr%2Fauthentication%2Flogin-callback',
      'state=stateTraces',
      'nonce=nonceTraces',
      'acr_values=eidas3',
    ].join('&');

  const mireUrl = new RegExp('/interaction/[^/]+');

  it('should display active and visible IdP', () => {
    // Given
    cy.visit(authorizeUrl);
    cy.url().should('match', mireUrl);
    // Then
    cy.get('#idp-list').within(() => {
      // Visibles idps
      cy.get('button#idp-fip1v2').should('exist');
      cy.get('button#idp-fip2v2').should('exist');
      cy.get('button#idp-fip-desactive-visible').should('exist');
      // Invisibles idps
      cy.get('button#idp-fip-desactive-invisible').should('not.exist');
      cy.get('button#idp-fip-active-invisible').should('not.exist');
    });
  });

  it('should display as disable "not active but visible" IdP', () => {
    // Given
    cy.visit(authorizeUrl);
    cy.url().should('match', mireUrl);
    // Then
    cy.get('#idp-list').within(() => {
      // Enabled idps
      cy.get('button#idp-fip1v2').should('not.be.disabled');
      cy.get('button#idp-fip2v2').should('not.be.disabled');
      // Disabled idps
      cy.get('button#idp-fip-desactive-visible').should('be.disabled');
    });
  });

  it('should not do anything when click on disabled IdP', () => {
    // Given
    cy.visit(authorizeUrl);
    cy.url().should('match', mireUrl);
    // When
    cy.get('#idp-list button#idp-fip-desactive-visible').click({ force: true });
    // Then
    cy.url().should('match', mireUrl);
  });

  it('should redirect when click on enabled IdP', () => {
    // Given
    cy.visit(authorizeUrl);
    cy.url().should('match', mireUrl);
    // When
    cy.get('#idp-list button#idp-fip1v2').click();
    // Then
    cy.url().should('match', new RegExp('^https://fip1v2.+$'));
  });

  it('should trigger error 020017 when forging click on disabled IdP', () => {
    // Given
    cy.visit(authorizeUrl);
    cy.url().should('match', mireUrl);
    // When
    cy.get('#idp-list button#idp-fip-desactive-visible')
      // Remove the disabled attribute
      .invoke('attr', 'disabled', false)
      .click();
    // Then
    cy.url().should('be', '/redirect-to-idp');

    cy.hasError('Y020017');
  });

  it('should trigger error 020019 when forging click on non existing IdP', () => {
    // Given
    cy.visit(authorizeUrl);
    cy.url().should('match', mireUrl);
    // When
    cy.get('#fs-request-fip1v2').within(() => {
      cy.get('input[name="providerName"]').invoke(
        'attr',
        'value',
        'random-non-exisitig-IdP',
      );
      cy.get('button#idp-fip1v2').click();
    });
    // Then
    cy.url().should('be', '/redirect-to-idp');
    cy.hasError('Y020019');
  });
});
