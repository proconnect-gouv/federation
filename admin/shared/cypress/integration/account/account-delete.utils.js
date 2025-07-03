export function deleteUser(username, confirmSuppression = true) {
  cy.get(
    `form[data-element-title="${username}"] button.btn-action-delete`,
  ).click();
  cy.contains(`Voulez-vous supprimer le compte ${username} ?`);

  if (confirmSuppression) {
    cy.totp({ totp: true });
    cy.contains('Confirmer').click();
  } else {
    cy.contains('Annuler').click();
  }
}
