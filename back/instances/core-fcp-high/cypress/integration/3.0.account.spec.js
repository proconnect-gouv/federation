import { basicErrorScenario } from './mire.utils';

describe('3.0 - Account', () => {
  // -- replace by either `fip1v2` or `fia1v2`
  const idpId = `${Cypress.env('IDP_NAME')}1v2`;

  it('should trigger error Y180001 (user blocked)', () => {
    basicErrorScenario({
      errorCode: 'E000001',
      idpId,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
    });
    cy.hasError('Y180001');
  });
});
