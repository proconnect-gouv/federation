import {
  basicScenario,
  checkInStringifiedJson,
  getIdentityProvider,
} from './mire.utils';

const scopes = 'openid given_name usual_name uid email';

// -- replace by either `fip1v2` or `fia1v2`
const idpId = `${Cypress.env('IDP_NAME')}1v2`;

describe('Identity Check', () => {
  it('should failed when userInfos AgentConnect have missing claims returned from IdP', () => {
    // hack to ask missing scope
    const { IDP_ROOT_URL } = getIdentityProvider();
    cy.registerProxyURL(`${IDP_ROOT_URL}/authorize?*`, {
      // email missing voluntary
      scope: scopes.replace('email', ''),
    });

    basicScenario({
      idpId,
    });

    cy.proxyURLWasActivated();

    cy.hasError('Y000006');
    cy.contains(` Invalid identity from ${Cypress.env('IDP_NAME')}1v2`);
    cy.contains('"isEmail": "email must be an email"');
    // only one error
    cy.contains(/(?:"constraints"){1}.*?(constraints)/).should('not.exist');
  });

  it('should success when userInfos AgentConnect have also an unknown claims from IdP', () => {
    const { IDP_ROOT_URL } = getIdentityProvider();
    cy.registerProxyURL(`${IDP_ROOT_URL}/authorize?*`, {
      scope: `${scopes} unknown_prop_for_test`,
    });

    basicScenario({
      login: 'E020025',
      idpId,
    });

    cy.proxyURLWasActivated();

    checkInStringifiedJson('unknown_prop_for_test');
  });
});
