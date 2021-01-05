// Path to script
const EXEC_TOOL_PATH = './cypress/support/scripts/parseBusinessLog.js';
const CORE_LOG_FILE_PATH = Cypress.env('CORE_LOG_FILE_PATH');

export function hasBusinessLog(event) {
  cy.getCookie('fc_interaction_id').then((cookie) => {
    const interactionId = cookie.value.match(/s%3A([^.]+)/).pop();
    const stringifiedEvent = JSON.stringify({ interactionId, ...event });
    const command = `node ${EXEC_TOOL_PATH} '${CORE_LOG_FILE_PATH}' '${stringifiedEvent}'`;

    console.log(`
    Executing command:
    > ${command}
    `);

    return cy.exec(command).its('code').should('eq', 0);
  });
}
