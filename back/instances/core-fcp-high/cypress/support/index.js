/**
 * Custom Cypress commands
 *
 * @see https://on.cypress.io/custom-commands
 */
import { hasBusinessLog, hasError } from './commands';
import "cypress-plugin-tab";

Cypress.Commands.add('hasError', hasError);
Cypress.Commands.add('hasBusinessLog', hasBusinessLog);
