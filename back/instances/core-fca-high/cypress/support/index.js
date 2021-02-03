/**
 * Custom Cypress commands
 *
 * @see https://on.cypress.io/custom-commands
 */
import { hasBusinessLog, hasError, inConsole, deleteCookie, e2e, resetdb } from './commands';

Cypress.Commands.add('hasError', hasError);
Cypress.Commands.add('hasBusinessLog', hasBusinessLog);
Cypress.Commands.add('inConsole', inConsole);
Cypress.Commands.add('e2e', e2e);
Cypress.Commands.add('resetdb', resetdb);

Cypress.Commands.overwrite('clearCookie', deleteCookie);
