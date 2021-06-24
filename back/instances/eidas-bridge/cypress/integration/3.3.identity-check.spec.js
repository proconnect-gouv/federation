import {
  configureOidcSpMockRequest,
  configureEidasSpMockRequest,
  chooseIdp,
  authenticateToEUIdp,
  authenticateToIdp,
  checkInformationsEuSpFrIdp,
  checkInformationsFrSpEuIdp,
  basicSuccessScenarioEuSpFrIdp,
  basicSuccessScenarioFrSpEuIdp,
} from './mire.utils';

const SCOPES_FR =
  'openid given_name family_name gender birthdate birthplace birthcountry email';
const SCOPES_EIDAS = 'openid given_name family_name birthdate';

const SCOPES_FULL =
  'openid profile email address phone preferred_username birthplace birthcountry';

describe('Identity Check', () => {
  describe('Sp from EU to idp from FR >', () => {
    const baseUrl = Cypress.env('IDP_ROOT_URL').replace(
      'IDP_NAME',
      `${Cypress.env('IDP_NAME')}1v2`,
    );

    it('should failed when userInfos FC+ have missing claims returned from IdP FR', () => {
      // hack to ask missing scope

      cy.registerProxyURL(`${baseUrl}/user/authorize?*`, {
        // email missing voluntary
        scope: SCOPES_FR.replace('email', ''),
      });

      const params = {
        idpId: `${Cypress.env('IDP_NAME')}1v2`,
      };

      configureEidasSpMockRequest();
      chooseIdp(params);
      authenticateToIdp(params);

      cy.proxyURLWasActivated();

      cy.hasError('Y000007');
      cy.contains(` Invalid identity from ${Cypress.env('IDP_NAME')}1v2`);
      cy.contains('"isEmail": "email must be an email"');
      // only one error
      cy.contains(/(?:"constraints"){1}.*?(constraints)/).should('not.exist');
    });

    it('should success when userInfos FC+ have also an unknown claims from IdP FR', () => {
      cy.registerProxyURL(`${baseUrl}/user/authorize?*`, {
        scope: `${SCOPES_FULL} unknown_prop_for_test`,
      });

      basicSuccessScenarioEuSpFrIdp({
        logWith: {
          idpId: `${Cypress.env('IDP_NAME')}1v2`,
          login: 'E020025',
        },
      });

      cy.proxyURLWasActivated();

      const expectedIdentity = [
        { name: 'BirthName', value: '[Martin]' },
        { name: 'FamilyName', value: '[Martin]' },
        { name: 'FirstName', value: '[Didier_E020025]' },
        { name: 'DateOfBirth', value: '[1981-02-03]' },
        { name: 'Gender', value: '[Male]' },
        {
          name: 'PersonIdentifier',
          value:
            '[FR/BE/cb9c1f5e5313a460114433a71b42511a194b996da1a3716a8d6c892a1d4307c3v1]',
        },
        { name: 'PlaceOfBirth', value: '[75112]' },
      ];
      checkInformationsEuSpFrIdp({ expectedIdentity });

      cy.get('.table-responsive > table.table.table-striped')
        .contains('unknown_prop_for_test')
        .should('not.exist');
    });
  });

  describe('Sp from FR to idp from EU >', () => {
    const baseUrl = Cypress.env('BRIDGE_ROOT_URL');

    it('should failed when userInfos FC+ have missing claims returned from IdP EU', () => {
      cy.registerProxyURL(`${baseUrl}/authorize?*`, {
        scope: SCOPES_EIDAS.replace('family_name', ''),
      });

      // start with Sp FR
      configureOidcSpMockRequest();
      // login on EU idp
      authenticateToEUIdp({ optionalAttributes: false });

      cy.hasError('Y000007');
      cy.contains(` Invalid identity from eidas-bridge`);
      cy.contains('"property": "family_name"');
      // only one error
      cy.contains(/(?:"constraints"){1}.*?(constraints)/).should('not.exist');
    });

    it('should success when userInfos FC+ have also an unknown claims from IdP EU', () => {
      cy.registerProxyURL(`${baseUrl}/authorize?*`, {
        scope: `${SCOPES_FULL} unknown_prop_for_test`,
      });

      basicSuccessScenarioFrSpEuIdp();

      checkInformationsFrSpEuIdp();
    });
  });
});
