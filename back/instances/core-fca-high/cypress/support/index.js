/**
 * Custom Cypress commands
 *
 * @see https://on.cypress.io/custom-commands
 */
import { hasBusinessLog, hasError } from './commands';

Cypress.Commands.add('hasError', hasError);
Cypress.Commands.add('hasBusinessLog', hasBusinessLog);
