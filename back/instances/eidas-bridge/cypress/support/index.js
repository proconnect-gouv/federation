/**
 * Custom Cypress commands
 *
 * @see https://on.cypress.io/custom-commands
 */
import { hasBusinessLog } from './commands';

/**
 * Needed because the eidas node throws unhandled exceptions in the front javasript
 * and it stop the test with a "decodeCurrentAddress is not defined"
 */
Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from
  // failing the test
  console.error(err);
  return false;
});

Cypress.Commands.add('hasBusinessLog', hasBusinessLog);
