import { Given } from '@badeball/cypress-cucumber-preprocessor';

Given(
  'je me connecte sur ProConnect Identité avec le mot de passe {string}',
  function (password: string) {
    cy.get(".fr-password input[name='password']").clearThenType(password);
    cy.get("button[type='submit']").first().click();
  },
);

Given('je sélectionne une organisation publique', function () {
  cy.get('#submit-join-organization-1').click();
});

Given('je sélectionne une organisation privée', function () {
  cy.get('#submit-join-organization-49').click();
});
