import { Then } from '@badeball/cypress-cucumber-preprocessor';

Then('je suis redirigé vers la page erreur technique', function () {
  cy.get('[data-testid="error-section"]').should('be.visible');
});

Then(
  "le titre de la page d'erreur est {string}",
  function (errorTitle: string) {
    cy.get('[data-testid="error-section-title"]').should('contain', errorTitle);
  },
);

Then("le code d'erreur est {string}", function (errorCode: string) {
  cy.get('[data-testid="error-code"]').should(
    'contain',
    `code erreur : ${errorCode}`,
  );
});

Then("le message d'erreur est {string}", function (errorMessage: string) {
  cy.get('[data-testid="error-message"]').should('contain', `${errorMessage}`);
});

Then('le numéro de session AgentConnect est affiché', function () {
  cy.contains('[data-testid="error-session-id"]')
    .invoke('text')
    .should(
      'match',
      /^ID : [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
});

Then(
  /^le lien retour vers le FS (est|n'est pas) affiché dans la page erreur technique$/,
  function (text: string) {
    const isVisible = text === 'est';
    cy.get('[data-testid="back-to-sp-link"]').should(
      isVisible ? 'be.visible' : 'not.exist',
    );
  },
);
