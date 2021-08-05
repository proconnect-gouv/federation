import { Given } from 'cypress-cucumber-preprocessor/steps';

import { getScopeByType } from '../../usager/helpers';
import { getServiceProviderByDescription } from '../helpers';

Given("j'utilise le fournisseur de service {string}", function (description) {
  getServiceProviderByDescription(this.serviceProviders, description);
});

Given(
  /le fournisseur de service requiert l'accès aux informations (?:du|des) scopes? "([^"]+)"/,
  function (type) {
    const scope = getScopeByType(this.scopes, type);
    cy.wrap(scope).as('requestedScope');
  },
);

Given(
  'le fournisseur de service requiert un niveau de sécurité {string}',
  function (acrValue) {
    this.serviceProvider.acrValue = acrValue;
  },
);

Given(
  'le fournisseur de service se connecte à FranceConnect via la méthode {string}',
  function (authorizeHttpMethod: 'post' | 'get') {
    this.serviceProvider.authorizeHttpMethod = authorizeHttpMethod;
  },
);
