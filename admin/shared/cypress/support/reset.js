const SAFETY_EXEC_TIMEOUT = 10000; // 10 sec
const LONG_EXEC_TIMEOUT = 60 * 1000; // 1 minutes

const DOCKER_DIR = 'cd $PC_ROOT/federation/docker';

export function resetMongo() {
  const command = `${DOCKER_DIR} && CI=1 ./docker-stack reset-db`;

  console.log(`
    Executing command:
    > ${command}
  `);

  return cy
    .exec(command, { timeout: SAFETY_EXEC_TIMEOUT })
    .its('code')
    .should('eq', 0);
}

export function resetPostgres() {
  const command = ` ../shared/cypress/support/db.sh ${Cypress.env(
    'APP_NAME',
  )} apply`;

  cy.log(`
    Executing command:
    > ${command}'
    `);

  return cy
    .exec(command, { timeout: SAFETY_EXEC_TIMEOUT })
    .its('code')
    .should('eq', 0);
}

export function resetEventsStats() {
  const command1 = `${DOCKER_DIR} && CI=1 ./docker-stack reset-stats`;

  console.log(`
      Executing command:
      > ${command1}
    `);

  cy.exec(command1, { timeout: SAFETY_EXEC_TIMEOUT })
    .its('code')
    .should('eq', 0);

  const command2 = `${DOCKER_DIR} && CI=1 ./docker-stack generate-events`;

  console.log(`
        Executing command:
        > ${command2}
      `);

  /**
   * the script requires a long time to load due to logs generating
   */
  return cy
    .exec(command2, { timeout: LONG_EXEC_TIMEOUT })
    .its('code')
    .should('eq', 0);
}

export function resetMetricsStats() {
  const command1 = `${DOCKER_DIR} && CI=1 ./docker-stack reset-stats`;

  console.log(`
    Executing command:
    > ${command1}
  `);

  cy.exec(command1, { timeout: SAFETY_EXEC_TIMEOUT })
    .its('code')
    .should('eq', 0);

  const command2 = `${DOCKER_DIR} && CI=1 ./docker-stack generate-metrics`;

  console.log(`
      Executing command:
      > ${command2}
    `);

  return cy
    .exec(command2, { timeout: SAFETY_EXEC_TIMEOUT * 3 })
    .its('code')
    .should('eq', 0);
}
