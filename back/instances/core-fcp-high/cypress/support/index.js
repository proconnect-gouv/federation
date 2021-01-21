/**
 * Custom Cypress commands
 *
 * @see https://on.cypress.io/custom-commands
 */
import { e2e, hasBusinessLog, hasError, resetdb } from './commands';
import "cypress-plugin-tab";

Cypress.Commands.add('hasError', hasError);
Cypress.Commands.add('hasBusinessLog', hasBusinessLog);
Cypress.Commands.add('e2e', e2e);
Cypress.Commands.add('resetdb', resetdb);
