import { getAuthorizeUrl } from './mire.utils';

describe('7.1 Idp whitelist & blacklist', () => {
  const mireUrl = new RegExp('/interaction/[^/]+');

  it('should display only whitelist idps', () => {
    cy.visit(getAuthorizeUrl({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: `${Cypress.env('SP2_CLIENT_ID')}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uri: `${Cypress.env('SP2_ROOT_URL')}/oidc-callback/envIssuer`,
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
});
