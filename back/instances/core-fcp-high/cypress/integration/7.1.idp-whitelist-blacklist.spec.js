import { getAuthorizeUrl } from './mire.utils';

describe('7.1 Idp whitelist & blacklist', () => {
  // -- replace by either `fip` or `fia`
  const idpId = `${Cypress.env('IDP_NAME')}`;

  const mireUrl = new RegExp('/interaction/[^/]+');

  it('should display only whitelisted idps', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // Then
    cy.get('#idp-list').within(() => {
      // Enabled idps
      cy.get(`button#idp-${idpId}1v2`).should('not.be.disabled');
      cy.get(`button#idp-${idpId}2v2`).should('not.be.disabled');
      cy.get(`button#idp-${idpId}6v2`).should('not.be.disabled');
      cy.get(`button#idp-${idpId}7v2`).should('not.be.disabled');
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
      cy.get(`button#idp-${idpId}1v2`).should('not.be.disabled');
      cy.get(`button#idp-${idpId}2v2`).should('not.be.disabled');
      cy.get(`button#idp-${idpId}6v2`).should('not.be.disabled');
      // Disabled idps
      cy.get(`button#idp-${idpId}-desactive-visible`).should('be.disabled');
    });
  });
});
