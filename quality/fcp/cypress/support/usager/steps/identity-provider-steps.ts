import { Then, When } from 'cypress-cucumber-preprocessor/steps';

import { User } from '../../common/helpers';
import { UserCredentials } from '../../common/types';
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
  const userCredentials: UserCredentials = currentUser.getCredentials(idpId);
  expect(userCredentials).to.exist;
  identityProviderPage.login(userCredentials);
});
