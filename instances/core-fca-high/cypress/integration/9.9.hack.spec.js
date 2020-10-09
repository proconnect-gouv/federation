import { basicErrorScenario } from './mire.utils';

describe('Interaction steps discarding', () => {
  /**
   * @TODO #252 
   * ETQ Dev, je vérifie la pertinence des tests cypress
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/252
   */
  it.skip('should trigger error Y150003 when going straigth to /login without a session', () => {
    const interactionId = 'foobar';
    cy.visit(
      `${Cypress.env('FC_ROOT_URL')}/api/v2/interaction/${interactionId}/login`,
      { failOnStatusCode: false },
    );
    cy.hasError('Y150003');
  });
  /**
   * @TODO #252 
   * ETQ Dev, je vérifie la pertinence des tests cypress
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/252
   */
  it.skip('should trigger error Y000004 when going to /login with a session', () => {
    const SP_URL = Cypress.env('SP1_ROOT_URL');

    cy.visit(SP_URL);
    cy.get('#connect-GET').click();

    cy.url().should(
      'include',
      `${Cypress.env('FC_ROOT_URL')}/api/v2/interaction`,
    );

    cy.getCookie('fc_interaction_id').then((cookie) => {
      const interactionId = cookie.value.match(/s%3A([^.]+)/).pop();
      cy.visit(
        `${Cypress.env(
          'FC_ROOT_URL',
        )}/api/v2/interaction/${interactionId}/login`,
        { failOnStatusCode: false },
      );
      cy.hasError('Y000004');
    });
  });
  it('should trigger error Y000005 when csrf token not matching with csrfToken in session', () => {
    basicErrorScenario({
      errorCode: 'test',
      idpId: 'fip1v2',
    });

    cy.get('input[name="_csrf"]').then((csrf) => {
      csrf[0].value = 'obviouslyBadCSRF';
    });

    cy.get('#consent').click();

    cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/login`));
    cy.hasError('Y000005');
  });
  it('should trigger error Y000005 when csrf token is empty', () => {
    basicErrorScenario({
      errorCode: 'test',
      idpId: 'fip1v2',
    });

    cy.get('input[name="_csrf"]').then((csrf) => {
      csrf[0].value = '';
    });

    cy.get('#consent').click();

    cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/login`));
    cy.hasError('Y000005');
  });
  it('should display "Not found" if we GET on /consent', () => {
    basicErrorScenario({
      errorCode: 'test',
      idpId: 'fip1v2',
    });

    cy.getCookie('fc_interaction_id').then((cookie) => {
      const interactionId = cookie.value.match(/s%3A([^.]+)/).pop();
      cy.request({
        url: `${Cypress.env('FC_INTERACTION_URL')}/${interactionId}/login`,
        method: 'GET',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.statusText).to.eq('Not Found');
      });
    });
  });
  it('should trigger error Y000400 when csrf token is not present', () => {
    basicErrorScenario({
      errorCode: 'test',
      idpId: 'fip1v2',
    });

    cy.get('input[name="_csrf"]').then((csrf) => {
      csrf[0].remove();
    });

    cy.get('#consent').click();

    cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/login`));
    cy.hasError('Y000400');
  });
});
