import {
  basicScenario,
  validateConsent,
  checkInStringifiedJson,
} from './mire.utils';

const scopes =
  'openid given_name family_name gender birthdate birthplace birthcountry email';

// -- replace by either `fip1v2` or `fia1v2`
const idpId = `${Cypress.env('IDP_NAME')}1v2`;

describe('Identity Check', () => {
  it('should failed when userInfos FC+ have missing claims returned from IdP FR', () => {
    // hack to ask missing scope
    cy.registerProxyURL(`${Cypress.env('IDP_ROOT_URL')}/user/authorize?`, {
      // email missing voluntary
      scope: scopes.replace('email', ''),
    });

    basicScenario({
      idpId,
    });

    cy.proxyURLWasActivated();

    cy.hasError('Y000007');
    cy.contains(` Invalid identity from ${Cypress.env('IDP_NAME')}1v2`);
    cy.contains('"isEmail": "email must be an email"');
    // only one error
    cy.contains(/(?:"constraints"){1}.*?(constraints)/).should('not.exist');
  });

  it('should success when userInfos FC+ have also an unknown claims from IdP FR', () => {
    cy.registerProxyURL(`${Cypress.env('IDP_ROOT_URL')}/user/authorize?`, {
      scope: `${scopes} unknown_prop_for_test`,
    });

    basicScenario({
      login: 'E020025',
      idpId,
    });

    cy.proxyURLWasActivated();

    validateConsent();

    checkInStringifiedJson('unknown_prop_for_test_');
  });
});
