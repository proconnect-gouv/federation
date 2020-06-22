import { basicErrorScenario, getAuthorizeUrl } from './mire.utils';

describe('Acr', () => {
  it('should trigger error Y000400 (HTTP 400) when acr from SP is not supported', () => {
    // Control visit
    const controlUrl = getAuthorizeUrl();
    cy.visit(controlUrl);
    cy.get('#idp-fip1v2').should('exist');

    // Real test
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const testUrl = getAuthorizeUrl({ acr_values: 'NonSupportedAcr' });
    cy.visit(testUrl, { failOnStatusCode: false });
    cy.hasError('Y000400');
  });

  it('should trigger error Y020001 when acr from IdP is lower than asked', () => {
    basicErrorScenario({
      errorCode: 'test',
      idpId: 'fip1v2',
      eidasLevel: 'eidas1',
    });

    cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/verify`));
    cy.hasError('Y020001');
  });
});
