import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

import { getIdentityProviderByDescription } from '../../common/helpers';

Then('je suis redirigé vers la page interaction', function () {
  cy.get('[data-testid="interaction-connection-button"]').should('be.visible');
});

When("j'entre l'email {string}", function (email: string) {
  cy.get('#email-input').clearThenType(email);
});

When('je clique sur le bouton de connexion', function () {
  cy.get('[data-testid="interaction-connection-button"]').click();
});

Then('le champ email correspond à {string}', function (email: string) {
  cy.get('#email-input').invoke('val').should('be.equal', email);
});

Given(
  /je paramètre un intercepteur pour l'appel authorize au fournisseur d'identité "([^"]*)"/,
  function (idpDescription: string) {
    const { url } = getIdentityProviderByDescription(idpDescription);
    cy.intercept(`${url}/auth*`).as('FI:Authorize');
  },
);

Given(
  'je mets le state fourni par AC dans le paramètre "state" de la requête',
  function () {
    cy.wait('@FI:Authorize')
      .its('request.query.state')
      .should('exist')
      .then((value: string) => {
        this.apiRequest.qs['state'] = value;
      });
  },
);
