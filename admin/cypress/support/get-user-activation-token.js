export function getUserActivationToken(username) {
  const command = `../shared/cypress/support/get-user-activation-token.sh ${Cypress.env('APP_NAME')} ${username}`
  
  cy.log(`
    Executing command:
    > ${command}'
  `);

  return cy.exec(command);
}