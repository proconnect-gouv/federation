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

  const currentUser: User = this.user;
  const { idpId } = this.identityProvider;
  const hasIDPCredentials = (credentials: UserCredentials): boolean =>
    credentials.idpId === idpId;

  const userCredentials = currentUser.credentials.find(hasIDPCredentials);
  identityProviderPage.login(userCredentials);
});
