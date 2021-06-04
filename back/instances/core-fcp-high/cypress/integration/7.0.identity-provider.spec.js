import { getAuthorizeUrl } from './mire.utils';

describe('Idp activation & visibility', () => {
  // -- replace by either `fip` or `fia`
  const idpId = `${Cypress.env('IDP_NAME')}`;

  const mireUrl = new RegExp('/interaction/[^/]+');

  it('should display active and visible IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // Then
    cy.get('#idp-list').within(() => {
      // Visibles idps
      cy.get(`button#idp-${idpId}1v2`).should('exist');
      cy.get(`button#idp-${idpId}2v2`).should('exist');
      cy.get(`button#idp-${idpId}-desactive-visible`).should('exist');
      // Invisibles idps
      cy.get(`button#idp-${idpId}-desactive-invisible`).should('not.exist');
      cy.get(`button#idp-${idpId}-active-invisible`).should('not.exist');
    });
  });

  it('should display as disable "not active but visible" IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // Then
    cy.get('#idp-list').within(() => {
      // Enabled idps
      cy.get(`button#idp-${idpId}1v2`).should('not.be.disabled');
      cy.get(`button#idp-${idpId}2v2`).should('not.be.disabled');
      // Disabled idps
      cy.get(`button#idp-${idpId}-desactive-visible`).should('be.disabled');
    });
  });

  it('should display the right title either for activated or disabled IdPs', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // Then
    cy.get('#idp-list').within(() => {
      // Control that title is set
      cy.get(`#idp-${idpId}1v2-title`).should('exist');
      cy.get(`#idp-${idpId}-desactive-visible-title`).should('exist');
      // Control that the right text is set
      cy.get(`#idp-${idpId}1v2-title`).contains(
        'J’utilise l’application Identity Provider - eIDAS élevé - discov - crypt',
      );
      cy.get(`#idp-${idpId}-desactive-visible-title`).contains(
        'FI désactivé mais visible est actuellement indisponible',
      );
    });
  });

  it('should not do anything when click on disabled IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // When
    cy.get(`#idp-list button#idp-${idpId}-desactive-visible`).click({
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
    cy.get(`#idp-list button#idp-${idpId}1v2`).click();
    // Then
    cy.url().should('match', new RegExp(`^https://${idpId}1v2.+$`));
  });

  it('should trigger error 020017 when forging click on disabled IdP', () => {
    // Given
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    // When
    cy.get(`#idp-list button#idp-${idpId}-desactive-visible`)
      // Remove the disabled attribute
      .invoke('attr', 'disabled', false)
      .click();
    // Then
    cy.url().should('contain', '/api/v2/redirect-to-idp');

    cy.hasError('Y020017');
  });

  it('should trigger error 020019 when forging click on non existing IdP', () => {
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
    cy.get(`#fs-request-${idpId}1v2`).within(() => {
      cy.get('input[name="providerUid"]').invoke(
        'attr',
        'value',
        'random-non-exisitig-IdP',
      );
      cy.get(`button#idp-${idpId}1v2`).click();
    });
    // Then
    cy.url().should('contain', '/api/v2/redirect-to-idp');
    cy.hasError('Y020019');
  });

  describe('No app restart needed', () => {
    beforeEach(() => {
      cy.resetdb();
    });

    it('should display an identity provider that has been added without an app restart needed', () => {
      cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);
      cy.get('#acrSelector').select('eidas2');
      cy.get('#get-authorize').click();
      cy.get('#idp-list').contains('Idp test Inserted').should('not.exist');

      cy.e2e('idp_insert');
      cy.wait(500);
      cy.reload();

      cy.get('#idp-list').contains('Idp test Inserted');
    });

    it('should update an identity provider properties, activate it, without an app restart needed', () => {
      cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);
      cy.get('#acrSelector').select('eidas2');
      cy.get('#get-authorize').click();
      cy.get('#idp-list').contains('Idp test Inserted').should('not.exist');

      cy.e2e('idp_insert');
      cy.e2e('idp_update_activate');
      cy.wait(500);
      cy.reload();

      cy.get('#idp-list').contains('Idp test Updated, activated');
    });

    it('should update an identity provider properties, deactivate it, without an app restart needed', () => {
      cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);
      cy.get('#acrSelector').select('eidas2');
      cy.get('#get-authorize').click();
      cy.get('#idp-list').contains('idp-test-update').should('not.exist');

      cy.e2e('idp_insert');
      cy.e2e('idp_update_activate');
      cy.wait(500);
      cy.reload();
      cy.get('#idp-list')
        .contains('Idp test Updated, activated')
        .should('exist');

      cy.e2e('idp_update_desactivate');
      cy.wait(500);
      cy.reload();
      cy.get('#idp-list').contains(
        'Idp test Updated, desactivated est actuellement indisponible',
      );
    });

    it('should remove an identity provider without an app restart needed', () => {
      cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);
      cy.get('#acrSelector').select('eidas2');
      cy.get('#get-authorize').click();
      cy.get('#idp-list').contains('idp-test-update').should('not.exist');

      cy.e2e('idp_insert');
      cy.e2e('idp_update_activate');
      cy.wait(500);
      cy.reload();
      cy.get('#idp-list')
        .contains('Idp test Updated, activated')
        .should('exist');

      cy.e2e('idp_remove');
      cy.wait(500);
      cy.reload();
      cy.get('#idp-list')
        .contains('Idp test Updated, activated')
        .should('not.exist');
    });
  });
});
