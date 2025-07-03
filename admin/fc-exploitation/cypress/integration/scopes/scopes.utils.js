export function useMenuToFdPage() {
  cy.get('li .nav-link')
    .contains('Scopes et claims')
    .click();
}

export function createScopeLabels(scopeLabel, basicConfiguration) {
  cy.get('#create-fd-btn').click();
  cy.formFill(scopeLabel, basicConfiguration);
}

export function updateScopeLabel(name, scopeLabelsInfo, configuration) {
  cy.contains(name)
    .scrollIntoView()
    .should('be.visible');
  cy.contains(name)
    .parent('tr')
    .find('.btn-action-update')
    .click();

  cy.contains(`Modifier le label`).should('be.visible');
  cy.get('input[name=scope]').should('have.value', name);

  cy.formFill(scopeLabelsInfo, configuration);
}

export function deleteScopeLabel(name, configuration) {
  cy.contains(name)
    .scrollIntoView()
    .should('be.visible');
  cy.contains(name)
    .parent('tr')
    .find('.btn-action-delete')
    .click();
  cy.get('form[name=deleteForm]').should('be.visible');
  cy.totp(configuration);
}
