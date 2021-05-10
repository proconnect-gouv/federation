import { Then, When } from 'cypress-cucumber-preprocessor/steps';

Then(
  "je suis redirigé vers la page 'sélection du fournisseur d'identité'",
  function () {
    cy.url().should('include', `${this.env.fcRootUrl}/api/v2/interaction`);
  },
);

When("je choisis un fournisseur d'identité avec {string}", function (acrValue) {
  // TODO: Select the correct FIP based on the criteria
  const currentIdentityProvider = this.identityProviders.find((provider) =>
    provider.acrValues.includes(acrValue),
  );
  cy.wrap(currentIdentityProvider).as('identityProvider');
  cy.get(currentIdentityProvider.selectors.idpButton).click();
});
