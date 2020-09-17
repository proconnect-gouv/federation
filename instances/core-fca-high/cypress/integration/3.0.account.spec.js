import { basicErrorScenario } from './mire.utils';

describe('Account', () => {
  it('should trigger error Y180001 (user blocked)', () => {
    basicErrorScenario({
      errorCode: 'E000001',
      idpId: 'fip1v2',
    });

    cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/verify`));
    cy.hasError('Y180001');
  });
});
