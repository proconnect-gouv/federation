import { basicErrorScenario } from './mire.utils';

describe('3.0 - Account', () => {
  // -- replace by either `fip1-high` or `fia1-low`
  const idpId = `${Cypress.env('IDP_NAME')}1-high`;

  it('should trigger error Y180001 (user blocked)', () => {
    basicErrorScenario({
      errorCode: 'Y180001',
      idpId,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
    });
    cy.hasError('Y180001');
  });
});
