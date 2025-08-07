export function updatePassword(username, currentPassword, newPassword) {
  cy.contains(username).click();
  cy.contains('Mon compte').click();
  cy.formType('#currentPassword', currentPassword);
  cy.formType('#password', newPassword);
  cy.formType('#confirm-password', newPassword);
  cy.get('#secret > td')
    .invoke('text')
    .then(secret => cy.totp({}, secret));
  cy.contains('Mettre à jour mon mot de passe').click();
}