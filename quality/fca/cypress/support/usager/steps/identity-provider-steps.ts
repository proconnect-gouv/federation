import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

import {
  getIdentityProviderByDescription,
  getServiceProviderByDescription,
} from '../../common/helpers';

Then(
  /je suis redirigé vers la page login du fournisseur d'identité "([^"]*)"/,
  function (description: string) {
    const { url } = getIdentityProviderByDescription(description);
    cy.url().should('include', url);
  },
);

When(
  "le fournisseur d'identité garantit un niveau de sécurité {string}",
  function (acr: string) {
    cy.get('input[name="acr"]').type(`{selectAll}${acr}`, { force: true });
  },
);

When("je m'authentifie", function () {
  cy.get("button[type='submit']").click();
});

When("j'utilise un compte usager privé", function () {
  cy.get('input[name="is_service_public"]').type(`{selectAll}false`, {
    force: true,
  });
});

When(
  "j'utilise le compte usager avec l'email {string}",
  function (email: string) {
    cy.get('input[name="email"]').type(`{selectAll}${email}`);
  },
);

When("j'utilise l'identité avec le sub {string}", function (sub: string) {
  cy.get('input[name="sub"]').type(`{selectAll}${sub}`, {
    force: true,
  });
});

When("j'utilise un compte usager sans email", function () {
  cy.get('input[name="email"]').clear();
});

When("j'utilise un compte usager avec téléphone incorrect", function () {
  cy.get('input[name="phone_number"]').type(`{selectAll}incorrect`, {
    force: true,
  });
});

When("j'utilise un compte usager avec email incorrect", function () {
  cy.get('input[name="email"]').type(`{selectAll}incorrect`);
});

When("j'utilise un compte usager avec siret incorrect", function () {
  cy.get('input[name="siret"]').type(`{selectAll}incorrect`, {
    force: true,
  });
});

When(
  "le fournisseur d'identité renvoie l'erreur {string} avec {string}",
  function (error: string, error_description: string) {
    cy.get('input[name="error"]').type(error, { force: true });
    cy.get('input[name="error_description"]').type(error_description, {
      force: true,
    });
  },
);

Then(
  /la page du FI affiche l'id du FS "([^"]*)"/,
  function (spDescription: string) {
    const { clientId } = getServiceProviderByDescription(spDescription);
    cy.contains(`"sp_id": "${clientId}"`);
  },
);

Then('le champ identifiant correspond à {string}', function (email: string) {
  cy.get('input[name="email"]').should('have.value', email);
});
