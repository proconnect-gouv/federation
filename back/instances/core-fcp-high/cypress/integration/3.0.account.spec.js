import { basicErrorScenario } from './mire.utils';

describe('Account', () => {
  // -- replace by either `fip1v2` or `fia1v2`
  const idpId = `${Cypress.env('IDP_NAME')}1v2`;

  it('should trigger error Y180001 (user blocked)', () => {
    basicErrorScenario({
      errorCode: 'E000001',
      idpId,
    });
    cy.hasError('Y180001');
  });
});
