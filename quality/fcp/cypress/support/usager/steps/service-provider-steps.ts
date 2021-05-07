import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

import ServiceProviderPage from '../pages/service-provider-page';

let serviceProviderPage: ServiceProviderPage;

Given(
  'le fournisseur de service est habilité à recevoir le scope {string}',
  function (type) {
    const currentServiceProvider = this.serviceProviders.find(
      (serviceProvide) => serviceProvide.scopes.includes(type),
    );
    cy.wrap(currentServiceProvider).as('serviceProvider');
    serviceProviderPage = new ServiceProviderPage(currentServiceProvider);
  },
);

Given(
  'le fournisseur de service demande accès aux informations du scope {string}',
  function (type) {
    const scope = this.scopes.find((scope) => scope.type === type);
    cy.wrap(scope).as('requestedScope');
  },
);

Given("je suis sur la page 'fournisseur de service'", function () {
  serviceProviderPage.visit();
});

When('je clique sur le bouton FranceConnect', function () {
  // Setup the requested scope and eidas on mocked environment
  if (this.env.type === 'mocked') {
    serviceProviderPage.setMockRequestedScope(this.requestedScope);
    serviceProviderPage.setMockRequestedAcr(this.serviceProvider.acrValue);
  }
  serviceProviderPage.fcButton.click();
});

Then("je suis redirigé vers la page 'fournisseur de service'", function () {
  serviceProviderPage.checkIsVisible();
});

Then('je suis connecté', function () {
  serviceProviderPage.checkIsUserConnected();
});

Then(
  'le fournisseur de service a accès aux informations du scope {string}',
  function (type) {
    const scope = this.scopes.find((scope) => scope.type === type);
    serviceProviderPage.checkMockInformationAccess(scope, this.user.details);
  },
);
