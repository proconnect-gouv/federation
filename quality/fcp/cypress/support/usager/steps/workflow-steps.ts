import { When } from 'cypress-cucumber-preprocessor/steps';

import { navigateTo, User } from '../../common/helpers';
import {
  Environment,
  IdentityProvider,
  ScopeContext,
  ServiceProvider,
  UserCredentials,
} from '../../common/types';
import { getDefaultScope } from '../helpers';
import IdentityProviderPage from '../pages/identity-provider-page';
import IdentityProviderSelectionPage from '../pages/identity-provider-selection-page';
import InfoConsentPage from '../pages/info-consent-page';
import ServiceProviderPage from '../pages/service-provider-page';
import TechnicalErrorPage from '../pages/technical-error-page';

const connectionWorkflow = (
  { allAppsUrl }: Environment,
  serviceProvider: ServiceProvider,
  identityProvider: IdentityProvider,
  user: User,
  scopeContext: ScopeContext | undefined,
  expectSuccess: boolean,
): void => {
  navigateTo({ appId: serviceProvider.name, baseUrl: allAppsUrl });
  const serviceProviderPage = new ServiceProviderPage(serviceProvider);
  if (scopeContext) {
    serviceProviderPage.setMockRequestedScope(scopeContext);
  }
  serviceProviderPage.fcButton.click();

  const identityProviderSelectionPage = new IdentityProviderSelectionPage();
  identityProviderSelectionPage.checkIsVisible();
  identityProviderSelectionPage.getIdpButton(identityProvider.idpId).click();

  const identityProviderPage = new IdentityProviderPage(identityProvider);
  const credentials: UserCredentials = user.getCredentials(
    identityProvider.idpId,
  );
  expect(credentials).to.exist;
  identityProviderPage.login(credentials);

  if (expectSuccess) {
    const infoConsent = new InfoConsentPage();
    infoConsent.consentButton.click();
    serviceProviderPage.checkIsUserConnected();
  } else {
    const technicalErrorPage = new TechnicalErrorPage();
    technicalErrorPage.checkIsVisible();
  }
};

When("l'usager peut se connecter à FranceConnect", function () {
  expect(this.env).to.exist;
  expect(this.serviceProvider).to.exist;
  expect(this.identityProvider).to.exist;
  expect(this.user).to.exist;
  connectionWorkflow(
    this.env,
    this.serviceProvider,
    this.identityProvider,
    this.user,
    getDefaultScope(this.scopes),
    true,
  );
});

When("l'usager ne peut pas se connecter à FranceConnect", function () {
  expect(this.serviceProvider).to.exist;
  expect(this.identityProvider).to.exist;
  expect(this.user).to.exist;
  connectionWorkflow(
    this.env,
    this.serviceProvider,
    this.identityProvider,
    this.user,
    getDefaultScope(this.scopes),
    false,
  );
});
