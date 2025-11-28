const SAFETY_EXEC_TIMEOUT = 10000; // 10 sec

const DOCKER_DIR = `cd ${Cypress.env('FEDERATION_DIR')}/docker`;

export function resetMongo() {
  const command = `${DOCKER_DIR} && CI=1 ./docker-stack reset-mongo`;

  console.log(`
    Executing command:
    > ${command}
  `);

  return cy
    .exec(command, { timeout: SAFETY_EXEC_TIMEOUT })
    .its('exitCode')
    .should('eq', 0);
}

export function resetPostgres() {
  const command = `./cypress/support/db.sh ${Cypress.env('APP_NAME')} apply`;

  cy.log(`
    Executing command:
    > ${command}'
    `);

  return cy
    .exec(command, { timeout: SAFETY_EXEC_TIMEOUT })
    .its('exitCode')
    .should('eq', 0);
}
