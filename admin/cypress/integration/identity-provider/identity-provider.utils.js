const BASE_URL = Cypress.config('baseUrl');

export function createIdentityProvider(identityProviderInfo, configuration) {
  cy.url().should('eq', `${BASE_URL}/identity-provider`);
  cy.contains("Créer un fournisseur d'identité").click();
  cy.wait(1);
  cy.formFill(identityProviderInfo, configuration);
  cy.wait(500);
  cy.get('form[name="fi-form"] button[type="submit"]').click({ force: true });
}

export function updateIdentityProvider(
  name,
  identityProviderUpdateInfo,
  configuration,
) {
  cy.url().should('eq', `${BASE_URL}/identity-provider?page=1&limit=9001`);
  cy.contains(name).should('exist');
  cy.contains(name)
    .closest('tr')
    .find('.btn-action-update')
    .click();

  cy.get('#fi-subtitle')
    .contains(`Modifier le fournisseur d'identité:`)
    .should('exist');

  cy.get('input[name=name]').should('have.value', name);
  cy.wait(1);
  cy.formFill(identityProviderUpdateInfo, configuration);

  if (configuration.amr) {
    cy.get('#amr-pop').check({ force: true });
    cy.get('#amr-sms').check({ force: true });
    cy.get('#amr-eye').check({ force: true });
  }

  cy.wait(500);
  cy.get('form[name="fi-form"] button[type="submit"]').click({ force: true });
}

export function assertFormValues(identityProviderInfo) {
  cy.formControl(identityProviderInfo);
}
