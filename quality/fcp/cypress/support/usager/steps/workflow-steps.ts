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

class ConnectionWorkflow {
  allAppsUrl: string;
  serviceProvider: ServiceProvider;
  identityProvider: IdentityProvider;
  serviceProviderPage: ServiceProviderPage;

  constructor({ allAppsUrl }: Environment, serviceProvider: ServiceProvider) {
    this.allAppsUrl = allAppsUrl;
    this.serviceProvider = serviceProvider;
  }

  init(): ConnectionWorkflow {
    navigateTo({
      appId: this.serviceProvider.name,
      baseUrl: this.allAppsUrl,
    });
    this.serviceProviderPage = new ServiceProviderPage(this.serviceProvider);
    return this;
  }

  withScope(scopeContext: ScopeContext): ConnectionWorkflow {
    this.serviceProviderPage.setMockRequestedScope(scopeContext);
    return this;
  }

  start(): ConnectionWorkflow {
    this.serviceProviderPage.fcButton.click();
    return this;
  }

  selectIdentityProvider(
    identityProvider: IdentityProvider,
  ): ConnectionWorkflow {
    this.identityProvider = identityProvider;
    const identityProviderSelectionPage = new IdentityProviderSelectionPage();
    identityProviderSelectionPage.checkIsVisible();
    identityProviderSelectionPage.getIdpButton(identityProvider.idpId).click();
    return this;
  }

  login(user: User): ConnectionWorkflow {
    const identityProviderPage = new IdentityProviderPage(
      this.identityProvider,
    );
    const credentials: UserCredentials = user.getCredentials(
      this.identityProvider.idpId,
    );
    expect(credentials).to.exist;
    identityProviderPage.login(credentials);
    return this;
  }

  checkError(): void {
    const technicalErrorPage = new TechnicalErrorPage();
    technicalErrorPage.checkIsVisible();
  }

  consent(): ConnectionWorkflow {
    const infoConsent = new InfoConsentPage();
    infoConsent.consentButton.click();
    return this;
  }

  checkConnected(): void {
    this.serviceProviderPage.checkIsUserConnected();
  }
}

When("l'usager peut se connecter à FranceConnect", function () {
  expect(this.env).to.exist;
  expect(this.serviceProvider).to.exist;
  expect(this.identityProvider).to.exist;
  expect(this.user).to.exist;
  new ConnectionWorkflow(this.env, this.serviceProvider)
    .init()
    .withScope(getDefaultScope(this.scopes))
    .start()
    .selectIdentityProvider(this.identityProvider)
    .login(this.user)
    .consent()
    .checkConnected();
});

When("l'usager ne peut pas se connecter à FranceConnect", function () {
  expect(this.env).to.exist;
  expect(this.serviceProvider).to.exist;
  expect(this.identityProvider).to.exist;
  expect(this.user).to.exist;
  new ConnectionWorkflow(this.env, this.serviceProvider)
    .init()
    .withScope(getDefaultScope(this.scopes))
    .start()
    .selectIdentityProvider(this.identityProvider)
    .login(this.user)
    .checkError();
});
