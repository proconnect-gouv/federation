import { Then, When } from 'cypress-cucumber-preprocessor/steps';

import IdentityProviderPage from '../pages/identity-provider-page';

let identityProviderPage: IdentityProviderPage;

Then(
  "je suis redirigé vers la page 'login du fournisseur d'identité'",
  function () {
    identityProviderPage = new IdentityProviderPage(this.identityProvider);
    identityProviderPage.checkIsVisible();
  },
);

When("je m'authentifie avec succès", function () {
  const idpId = this.identityProvider.idpId;
  const hasIDPCredentials = (credentials) => credentials.idpId === idpId;

  // Get the current user or default to the first user with credentials for the current IDP
  // TODO: Create a dedicated step to use default user
  let currentUser = this.user;
  if (!currentUser) {
    currentUser = this.users.find((user) =>
      user.credentials.some(hasIDPCredentials),
    );
    cy.wrap(currentUser).as('user');
  }

  const userCredentials = currentUser.credentials.find(hasIDPCredentials);
  identityProviderPage.login(userCredentials);
});
