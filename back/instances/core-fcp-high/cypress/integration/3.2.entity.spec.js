import { checkInStringifiedJson, basicScenario } from './mire.utils';

/**
 * @todo #242 - remove and let basic scopes
 */

describe('Entity', () => {
  it('should have the same client Sub from 2 SP with same entityId', () => {
    basicScenario({
      idpId: 'fip1v2',
    });

    // FC: Read confirmation message :D
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);

    // FC: validate consent
    cy.get('#consent').click();

    // return to FS
    cy.url().should('match', /interaction\/[^\/]+\/verify/);

    // Capture Sub from the first SP
    cy.get('#json-output').then((elem) => {
      const { sub } = JSON.parse(elem.text().trim());
      cy.wrap({ sub }).as('client:sub');
    });

    basicScenario({
      idpId: 'fip1v2',
      start: `${Cypress.env('SP2_ROOT_URL')}`,
    });

    // FC: Read confirmation message :D
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);

    // FC: validate consent
    cy.get('#consent').click();

    // return to FS
    cy.url().should('match', /interaction\/[^\/]+\/verify/);

    // Compare the two Sub from two linked FS
    cy.get('@client:sub').then(({ sub: previousSub }) => {
      checkInStringifiedJson('sub', previousSub);
    });
  });
});
