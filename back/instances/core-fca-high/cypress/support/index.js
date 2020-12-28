/**
 * Custom Cypress commands
 *
 * @see https://on.cypress.io/custom-commands
 */
import { hasBusinessLog, hasError, inConsole, deleteCookie } from './commands';

Cypress.Commands.add('hasError', hasError);
Cypress.Commands.add('hasBusinessLog', hasBusinessLog);
Cypress.Commands.add('inConsole', inConsole);

Cypress.Commands.overwrite('clearCookie', deleteCookie);
