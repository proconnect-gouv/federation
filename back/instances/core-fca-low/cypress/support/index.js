/**
 * Custom Cypress commands
 *
 * @see https://on.cypress.io/custom-commands
 */
import {
  hasBusinessLog,
  clearBusinessLog,
  hasError,
  inConsole,
  deleteCookie,
  e2e,
  resetdb,
  registerProxyURL,
  proxyURLWasActivated,
} from './commands';

Cypress.Commands.add('hasError', hasError);
Cypress.Commands.add('clearBusinessLog', clearBusinessLog);
Cypress.Commands.add('hasBusinessLog', hasBusinessLog);
Cypress.Commands.add('inConsole', inConsole);
Cypress.Commands.add('e2e', e2e);
Cypress.Commands.add('resetdb', resetdb);

Cypress.Commands.overwrite('clearCookie', deleteCookie);

Cypress.Commands.add('registerProxyURL', registerProxyURL);
Cypress.Commands.add('proxyURLWasActivated', proxyURLWasActivated);
