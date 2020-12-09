import { checkInStringifiedJson, basicScenario } from './mire.utils';

/**
 * @todo #242 - remove and let basic scopes
 */
const scope =
  'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address phone';

describe('Entity', () => {
  it('should have the same client Sub from 2 SP with same entityId', () => {
    basicScenario({
      idpId: 'fia1v2',
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_id: `${Cypress.env('SP1_CLIENT_ID')}`,
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        redirect_uri: `${Cypress.env('SP1_ROOT_URL')}/login-callback`,
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2',
        scope,
      },
    });

    // return to FS
    cy.url().should('include', `${Cypress.env('SP1_ROOT_URL')}/login-callback`);

    // Capture Sub from the first SP
    cy.get('#json').then((elem) => {
      const { sub } = JSON.parse(elem.text().trim());
      cy.wrap({ sub }).as('client:sub');
    });

    basicScenario({
      idpId: 'fia1v2',
      start: `${Cypress.env('SP2_ROOT_URL')}`,
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_id: `${Cypress.env('SP2_CLIENT_ID')}`,
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        redirect_uri: `${Cypress.env('SP2_ROOT_URL')}/login-callback`,
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2',
        scope,
      },
    });

    // return to FS
    cy.url().should('include', `${Cypress.env('SP2_ROOT_URL')}/login-callback`);

    // Compare the two Sub from two linked FS
    cy.get('@client:sub').then(({ sub: previousSub }) => {
      checkInStringifiedJson('sub', previousSub);
    });
  });
});
