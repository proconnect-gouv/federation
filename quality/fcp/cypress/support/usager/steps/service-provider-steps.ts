import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

import { ServiceProvider } from '../../common/types';
import ServiceProviderPage from '../pages/service-provider-page';

let serviceProviderPage: ServiceProviderPage;

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

When('je navigue sur la page fournisseur de service', function () {
  let currentServiceProvider: ServiceProvider = this.serviceProvider;
  // Get service provider matching the prerequisites
  if (!currentServiceProvider) {
    const supportedScopeType: string =
      this.supportedScopeType ?? 'tous les scopes';
    currentServiceProvider = this.serviceProviders.find(
      (serviceProvide: ServiceProvider) =>
        serviceProvide.scopes.includes(supportedScopeType),
    );
    expect(currentServiceProvider).to.exist;
    cy.wrap(currentServiceProvider).as('serviceProvider');
  }
  serviceProviderPage = new ServiceProviderPage(currentServiceProvider);
  serviceProviderPage.visit();
});

When('je clique sur le bouton FranceConnect', function () {
  // Setup the requested scope and eidas on mocked environment
  if (this.serviceProvider.mocked === true) {
    serviceProviderPage.setMockRequestedScope(this.requestedScope);
    serviceProviderPage.setMockRequestedAcr(this.serviceProvider.acrValue);
  }
  serviceProviderPage.fcButton.click();
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
      serviceProviderPage.checkMockInformationAccess(scope, this.user.details);
    }
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
