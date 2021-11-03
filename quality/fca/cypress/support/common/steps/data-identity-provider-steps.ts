import { Given } from 'cypress-cucumber-preprocessor/steps';

import {
  getIdentityProviderByAttributes,
  getIdentityProviderByDescription,
} from '../helpers';

Given("j'utilise le fournisseur d'identité {string}", function (description) {
  getIdentityProviderByDescription(this.identityProviders, description);
});

Given(
  /^j'utilise un fournisseur d'identité (actif|désactivé)$/,
  function (status) {
    const description = status === 'actif' ? 'par défaut' : 'désactivé';
    getIdentityProviderByDescription(this.identityProviders, description);
  },
);

Given(
  "j'utilise un fournisseur d'identité avec niveau de sécurité {string} et signature {string}",
  function (acrValue, signature) {
    const identityProvider = getIdentityProviderByAttributes(
      this.identityProviders,
      {
        acrValue,
        signature,
        usable: true,
      },
    );
    cy.log(`J'utilise le fournisseur d'identité ${identityProvider.idpId}`);
  },
);
