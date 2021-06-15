import { Then, When } from 'cypress-cucumber-preprocessor/steps';

import { IdentityProvider } from '../../common/types';

Then(
  "je suis redirigé vers la page sélection du fournisseur d'identité",
  function () {
    cy.url().should('include', `${this.env.fcRootUrl}/api/v2/interaction`);
  },
);

When(
  /^je choisis un fournisseur d'identité (actif|désactivé)$/,
  function (status) {
    const isEnabled = status === 'actif';
    const currentIdentityProvider: IdentityProvider =
      this.identityProviders.find((provider) => provider.enabled === isEnabled);
    cy.wrap(currentIdentityProvider).as('identityProvider');
    cy.get(currentIdentityProvider.selectors.idpButton).click();
  },
);

When("je choisis un fournisseur d'identité avec {string}", function (acrValue) {
  const currentIdentityProvider = this.identityProviders.find((provider) =>
    provider.acrValues.includes(acrValue),
  );
  cy.wrap(currentIdentityProvider).as('identityProvider');
  cy.get(currentIdentityProvider.selectors.idpButton).click();
});
