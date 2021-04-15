import { basicSuccessScenario } from './mire.utils';
import {
  connectToExploitation,
  getUserInfoByRole,
  role,
} from './exploitation.utils';

/*
 * Exemple de test cross application pour voir la mécanique.
 * Celui-ci sera à supprimer au moment de l'implémentation de vrais tests
 */
describe("Example Cross application e2e", () => {
  afterEach(() => {
    // Remove recent update for old e2e
    cy.resetEnv('mongoFC');
  });

  it("should access to exploitation to modified service provider name and do standard cinematic", () => {
    // Setup
    const mockConfig = {
      totp: true,
    };
    const spName = 'FSP - FSP1v2';
    const serviceProviderUpdated = {
      name: 'FSP - FSP1v2 - modified'
    };
    const idpId = `${Cypress.env('IDP_NAME')}1v2`;
    const { USER_NAME } = getUserInfoByRole(role.OPERATOR);

    // Action
    // Update fsp1v2 name
    connectToExploitation(role.OPERATOR);

    cy.contains(spName)
        .should('be.visible')
        .click();
    cy.url().should('match', /\/service-provider\/[a-z0-9]{24}$/);

    cy.formFill(serviceProviderUpdated, mockConfig);

    cy.get('form[name="fs-form"] button[type="submit"]').click();

    cy.logout(USER_NAME);

    // Cinematic with fsp1v2 modified
    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,

    });
  });
});
