import { getAuthorizeUrl, getServiceProvider } from './mire.utils';

describe('7.1 Idp whitelist & blacklist', () => {
  const mireUrl = new RegExp('/interaction/[^/]+');
  // -- replace by either `fip` or `fia`
  const idpId = `${Cypress.env('IDP_NAME')}`;
  const { SP_ROOT_URL, SP_CLIENT_ID } = getServiceProvider(`${Cypress.env('SP_NAME')}2v2`);


  it('should display only whitelist idps', () => {
    cy.visit(getAuthorizeUrl({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: `${SP_CLIENT_ID}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uri: `${SP_ROOT_URL}/oidc-callback/envIssuer`,
    }));
    cy.url().should('match', mireUrl);

    cy.get('#fi-search-term').type('provider');

    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia1v2"]',
    ).should('exist');
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia2v2"]',
    ).should('exist');
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia3v2"]',
    ).should('not.exist');
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia4v2"]',
    ).should('not.exist');
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia5v2"]',
    ).should('exist');
  });

  it('should not display blacklist idps', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);

    cy.get('#fi-search-term').type('provider');

    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia1v2"]',
    ).should('exist');
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia2v2"]',
    ).should('exist');
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia3v2"]',
    ).should('not.exist');
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia4v2"]',
    ).should('exist');
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia5v2"]',
    ).should('not.exist');
  });

  it('should trigger error 020023 when forging click on IdP in blacklist', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // When
    cy.get('#fi-search-term').type('provider');
    cy.get(`input[name="providerUid"][value="${idpId}1v2"]`).invoke(
      'attr',
      'value',
      'fia5v2',
    );
    cy.get(`input[name="providerUid"][value="fia5v2"]`).next().click();
    // Then
    cy.url().should('contain', '/api/v2/redirect-to-idp');
    cy.hasError('Y020023');
  });

  it('should trigger error 020023 when forging click on non existing IdP in whitelist', () => {
    // Given
    cy.visit(getAuthorizeUrl({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: `${SP_CLIENT_ID}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uri: `${SP_ROOT_URL}/oidc-callback/envIssuer`,
    }));
    cy.url().should('match', mireUrl);
    // When
    cy.get('#fi-search-term').type('provider');
    cy.get(`input[name="providerUid"][value="${idpId}1v2"]`).invoke(
      'attr',
      'value',
      'fia4v2',
    );
    cy.get(`input[name="providerUid"][value="fia4v2"]`).next().click();
    // Then
    cy.url().should('contain', '/api/v2/redirect-to-idp');
    cy.hasError('Y020023');
  });
});
