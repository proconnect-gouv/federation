import { Then, When } from 'cypress-cucumber-preprocessor/steps';

import IdentityProviderSelectionPage from '../pages/identity-provider-selection-page';

const identityProviderSelectionPage = new IdentityProviderSelectionPage();

Then(
  "je suis redirigé vers la page sélection du fournisseur d'identité",
  function () {
    identityProviderSelectionPage.checkIsVisible();
  },
);

When("je cherche le fournisseur d'identité par son ministère", function () {
  expect(this.identityProvider).to.exist;
  identityProviderSelectionPage.searchIdentityProvider(
    this.identityProvider.ministry,
  );
});

When("je cherche le fournisseur d'identité par son nom", function () {
  expect(this.identityProvider).to.exist;
  identityProviderSelectionPage.searchIdentityProvider(
    this.identityProvider.title,
  );
});

When("je sélectionne le fournisseur d'identité", function () {
  expect(this.identityProvider).to.exist;
  identityProviderSelectionPage.searchIdentityProvider(
    this.identityProvider.ministry,
  );
  identityProviderSelectionPage
    .getIdpButton(this.identityProvider.idpId)
    .click();
});

When("je recherche le fournisseur d'identité avec {string}", function (terms) {
  identityProviderSelectionPage.searchIdentityProvider(terms);
});

When("je clique sur le fournisseur d'identité", function () {
  expect(this.identityProvider).to.exist;
  identityProviderSelectionPage
    .getIdpButton(this.identityProvider.idpId)
    .click();
});
