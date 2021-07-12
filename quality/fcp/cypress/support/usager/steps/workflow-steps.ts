import { When } from 'cypress-cucumber-preprocessor/steps';

import { IdentityProvider, ServiceProvider, User } from '../../common/types';
import IdentityProviderPage from '../pages/identity-provider-page';
import IdentityProviderSelectionPage from '../pages/identity-provider-selection-page';
import InfoConsentPage from '../pages/info-consent-page';
import ServiceProviderPage from '../pages/service-provider-page';

const connectionWorkflow = (
  serviceProvider: ServiceProvider,
  identityProvider: IdentityProvider,
  user: User,
): void => {
  const serviceProviderPage = new ServiceProviderPage(serviceProvider);
  serviceProviderPage.visit();
  serviceProviderPage.fcButton.click();

  const identityProviderSelectionPage = new IdentityProviderSelectionPage();
  identityProviderSelectionPage.checkIsVisible();
  identityProviderSelectionPage.getIdpButton(identityProvider.idpId).click();

  const identityProviderPage = new IdentityProviderPage(identityProvider);
  const credentials = user.credentials.find(
    (credentials) => credentials.idpId === identityProvider.idpId,
  );
  identityProviderPage.login(credentials);

  const infoConsent = new InfoConsentPage();
  infoConsent.consentButton.click();
  serviceProviderPage.checkIsUserConnected();
};

When("l'usager peut se connecter à FranceConnect", function () {
  expect(this.serviceProvider).to.exist;
  expect(this.identityProvider).to.exist;
  expect(this.user).to.exist;
  connectionWorkflow(this.serviceProvider, this.identityProvider, this.user);
});
