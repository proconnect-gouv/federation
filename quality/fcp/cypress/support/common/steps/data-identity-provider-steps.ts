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

Given("j'utilise un fournisseur d'identité avec {string}", function (acrValue) {
  getIdentityProviderByAttributes(this.identityProviders, { acrValue });
});

Given(
  /^j'utilise un fournisseur d'identité supportant "([^"]*)"(?: avec chiffrement "([^"]*)" et signature "([^"]*)")?$/,
  function (acrValue, encryption, signature) {
    getIdentityProviderByAttributes(this.identityProviders, {
      acrValue,
      encryption,
      signature,
    });
  },
);
