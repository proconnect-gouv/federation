import { Then, When } from 'cypress-cucumber-preprocessor/steps';

import { User, UserCredentials } from '../../common/types';
import IdentityProviderPage from '../pages/identity-provider-page';

let identityProviderPage: IdentityProviderPage;

Then(
  "je suis redirigé vers la page login du fournisseur d'identité",
  function () {
    identityProviderPage = new IdentityProviderPage(this.identityProvider);
    identityProviderPage.checkIsVisible();
  },
);

When("je m'authentifie avec succès", function () {
  expect(this.user).to.exist;

  const currentUser: User = this.User;
  const { idpId } = this.identityProvider;
  const hasIDPCredentials = (credentials: UserCredentials): boolean =>
    credentials.idpId === idpId;

  const userCredentials = currentUser.credentials.find(hasIDPCredentials);
  identityProviderPage.login(userCredentials);
});

When("je m'authentifie avec un compte actif", function () {
  const { idpId } = this.identityProvider;
  const hasIDPCredentials = (credentials: UserCredentials): boolean =>
    credentials.idpId === idpId;

  // Get an actif user with credentials for the current IDP
  let currentUser: User = this.user;
  if (!currentUser) {
    currentUser = this.users.find(
      (user: User) =>
        user.enabled === true && user.credentials.some(hasIDPCredentials),
    );
    cy.wrap(currentUser).as('user');
  }

  const userCredentials = currentUser.credentials.find(hasIDPCredentials);
  identityProviderPage.login(userCredentials);
});
