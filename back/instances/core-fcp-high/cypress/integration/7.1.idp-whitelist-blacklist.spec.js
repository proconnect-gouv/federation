import { getAuthorizeUrl } from './mire.utils';

describe('7.1 - Idp whitelist & blacklist', () => {
  before(() => {
    cy.resetdb();
  });

  // -- replace by either `fip` or `fia`
  const idpId = `${Cypress.env('IDP_NAME')}`;

  const mireUrl = new RegExp('/interaction/[^/]+');

  it('should trigger error 020023 when forging click on non existing IdP in whitelist', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // When
    cy.get(`#fs-request-${idpId}1-high`).within(() => {
      cy.get('input[name="providerUid"]').invoke('attr', 'value', 'fip4-high');
      cy.get(`button#idp-${idpId}1-high`).click();
    });
    // Then
    cy.url().should('contain', '/api/v2/redirect-to-idp');
    cy.hasError('Y020023');
  });

  it('should trigger error 020023 when forging click on IdP in blacklist', () => {
    // Given
    cy.visit(
      getAuthorizeUrl({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_id: `${Cypress.env('SP2_CLIENT_ID')}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        redirect_uri: `${Cypress.env('SP2_ROOT_URL')}/oidc-callback/envIssuer`,
      }),
    );
    cy.url().should('match', mireUrl);
    // When
    cy.get(`#fs-request-${idpId}1-high`).within(() => {
      cy.get('input[name="providerUid"]').invoke('attr', 'value', 'fip7-high');
      cy.get(`button#idp-${idpId}1-high`).click();
    });
    // Then
    cy.url().should('contain', '/api/v2/redirect-to-idp');
    cy.hasError('Y020023');
  });

  it('should display only whitelisted idps', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // Then
    cy.get('#idp-list').within(() => {
      // Enabled idps
      cy.get(`button#idp-${idpId}1-high`).should('not.be.disabled');
      cy.get(`button#idp-${idpId}2-high`).should('not.be.disabled');
      cy.get(`button#idp-${idpId}6-high`).should('not.be.disabled');
      // Disabled idps
      cy.get(`button#idp-${idpId}-desactive-visible`).should('be.disabled');
    });
  });

  it('should display non blacklisted idps', () => {
    const overrideParams = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: `${Cypress.env('SP2_CLIENT_ID')}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uri: `${Cypress.env('SP2_ROOT_URL')}/oidc-callback/envIssuer`,
    };
    cy.visit(getAuthorizeUrl(overrideParams));
    cy.url().should('match', mireUrl);
    // Then
    cy.get('#idp-list').within(() => {
      // Enabled idps
      cy.get(`button#idp-${idpId}1-high`).should('not.be.disabled');
      cy.get(`button#idp-${idpId}2-high`).should('not.be.disabled');
      cy.get(`button#idp-${idpId}6-high`).should('not.be.disabled');
      // Disabled idps
      cy.get(`button#idp-${idpId}-desactive-visible`).should('be.disabled');
    });
  });
});
