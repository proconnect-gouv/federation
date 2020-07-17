describe('Interaction steps discarding', () => {
  it('should trigger error Y150003 when going straigth to /login without a session', () => {
    const interactionId = 'foobar';
    cy.visit(
      `${Cypress.env('FC_ROOT_URL')}/api/v2/interaction/${interactionId}/login`,
      { failOnStatusCode: false },
    );
    cy.hasError('Y150003');
  });
  it('should trigger error Y000004 when going to /login with a session', () => {
    const SP_URL = Cypress.env('UD1V2_ROOT_URL');

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
});
