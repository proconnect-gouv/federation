describe('Update cache', () => {
  beforeEach(() => {
    cy.resetdb();
  });

  it('should retrieve updated idp in database automatically, when redirecting to idp, without restarting the app', () => {
    cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);
    cy.get('#get-authorize').click();

    // purposefully corrupting the BDD so that we make the kinematics fail
    cy.e2e('idp_update_wrong_issuer');

    cy.get('#idp-fip2v2').click();
    cy.get('form').submit();
    cy.url().should('includes', Cypress.env('FC_ROOT_URL'));

    // having a wrong issuer the kinematics fails
    cy.contains('Y020026');
  });

  it('should retrieve updated sp from database automatically, without restarting the app', () => {
    cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

    // purposefully corrupting the BDD so that we make the kinematics fail
    cy.e2e('sp_update_scopes');

    cy.get('#get-authorize').click();

    cy.url().should('includes', Cypress.env('SP1_ROOT_URL'));

    // having wrong scopes the kinematics fails
    cy.url().should('includes', 'error=invalid_scope');
  });
});
