import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

import {
  checkFCBasicAuthorization,
  isUsingFCBasicAuthorization,
} from '../../common/helpers';
import { ServiceProvider } from '../../common/types';
import ServiceProviderPage from '../pages/service-provider-page';

let serviceProviderPage: ServiceProviderPage;

Given(/j'utilise le fournisseur de service "([^"]+)"/, function (description) {
  cy.log('this.serviceProviders', JSON.stringify(this.serviceProviders));

  const currentServiceProvider = this.serviceProviders.find(
    (serviceProvider: ServiceProvider) =>
      serviceProvider.description === description,
  );
  expect(currentServiceProvider).to.exist;
  cy.wrap(currentServiceProvider).as('serviceProvider');
});

Given(
  /le fournisseur de service est habilité à demander les? scopes? "([^"]+)"/,
  function (type) {
    cy.wrap(type).as('supportedScopeType');
  },
);

Given(
  /le fournisseur de service requiert l'accès aux informations (?:du|des) scopes? "([^"]+)"/,
  function (type) {
    const scope = this.scopes.find((scope) => scope.type === type);
    cy.wrap(scope).as('requestedScope');
  },
);

Given(
  /le fournisseur de service requiert un niveau de sécurité "([^"]+)"/,
  function (acrValue) {
    this.serviceProvider.acrValue = acrValue;
  },
);

Given(
  'le fournisseur de service se connecte à FranceConnect via la méthode {string}',
  function (method: 'post' | 'get') {
    this.serviceProvider.method = method;
  },
);

When('je navigue sur la page fournisseur de service', function () {
  let currentServiceProvider: ServiceProvider = this.serviceProvider;
  // Get service provider matching the prerequisites
  if (!currentServiceProvider) {
    const supportedScopeType: string =
      this.supportedScopeType ?? 'tous les scopes';
    currentServiceProvider = this.serviceProviders.find(
      (serviceProvider: ServiceProvider) =>
        serviceProvider.scopes.includes(supportedScopeType),
    );
    expect(currentServiceProvider).to.exist;
    cy.wrap(currentServiceProvider).as('serviceProvider');
  }
  serviceProviderPage = new ServiceProviderPage(currentServiceProvider);
  /**
   * @todo Use navigateTo instead after ticket FC-548 (integ01)
   * author: Nicolas
   * date: 28/05/2021
   *
   * suggestion: navigateTo({ appId: currentServiceProvider.name, baseUrl: env.allAppsUrl });
   */
  serviceProviderPage.visit();
});

When('je clique sur le bouton FranceConnect', function () {
  // Setup the requested scope and eidas on mocked environment
  if (this.serviceProvider.mocked === true) {
    serviceProviderPage.setMockRequestedScope(this.requestedScope);
    serviceProviderPage.setMockRequestedAcr(this.serviceProvider.acrValue);
    serviceProviderPage.clickMockFcButton(this.serviceProvider.method);
  } else {
    serviceProviderPage.fcButton.click();
  }

  if (isUsingFCBasicAuthorization()) {
    checkFCBasicAuthorization();
  }
});

Then('je suis redirigé vers la page fournisseur de service', function () {
  serviceProviderPage.checkIsVisible();
});

Then('je suis connecté', function () {
  serviceProviderPage.checkIsUserConnected();
});

Then(
  /le fournisseur de service a accès aux informations (?:du|des) scopes? "([^"]+)"/,
  function (type) {
    if (this.serviceProvider.mocked === true) {
      const scope = this.scopes.find((scope) => scope.type === type);
      serviceProviderPage.checkMockInformationAccess(scope, this.user.claims);
    }
  },
);

Then(
  'la cinématique a utilisé le niveau de sécurité {string}',
  function (acrValue) {
    serviceProviderPage.checkMockAcrValue(acrValue);
  },
);

Then(
  'je suis redirigé vers la page erreur du fournisseur de service',
  function () {
    serviceProviderPage.checkMockErrorCallback();
  },
);

Then(
  "le titre de l'erreur fournisseur de service est {string}",
  function (errorCode) {
    serviceProviderPage.checkMockErrorCode(errorCode);
  },
);

Then(
  "la description de l'erreur fournisseur de service est {string}",
  function (errorDescription) {
    serviceProviderPage.checkMockErrorDescription(errorDescription);
  },
);
