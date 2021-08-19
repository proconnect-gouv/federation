import { Given } from 'cypress-cucumber-preprocessor/steps';

import {
  getIdentityProviderByAcrValue,
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
  getIdentityProviderByAcrValue(this.identityProviders, acrValue);
});
