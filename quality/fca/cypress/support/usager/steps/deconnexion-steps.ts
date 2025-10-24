import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

import { getEnv, getIdentityProviderByDescription } from '../../common/helpers';

When(
  /je clique sur le bouton de déconnexion et j'enregistre la réponse de ProConnect et du FI "([^"]*)"/,
  function (description: string) {
    const { url: idpUrl } = getIdentityProviderByDescription(description);
    const { federationRootUrl } = getEnv();

    cy.intercept(`${idpUrl}/session/end*`).as('idp:sessionEnd');
    cy.intercept(`${federationRootUrl}/api/v2/client/logout-callback*`).as(
      'idp:logoutCallback',
    );
    cy.intercept(`${federationRootUrl}/api/v2/session/end/confirm*`).as(
      'fca:sessionEndConfirm',
    );

    cy.get('[action="/logout"] button').click();
  },
);

Then(
  'je suis déconnecté du fournisseur de service, de ProConnect et du FI',
  function () {
    cy.wait('@idp:sessionEnd').then((intercept) => {
      cy.log(intercept.request.url);
      expect(intercept.response?.statusCode).to.equal(200);
    });

    cy.wait('@idp:logoutCallback').then((intercept) => {
      cy.log(intercept.request.url);
      expect(intercept.response?.statusCode).to.equal(200);
    });

    cy.wait('@fca:sessionEndConfirm').then((intercept) => {
      cy.log(intercept.request.url);
      expect(intercept.response?.statusCode).to.equal(303);
    });
  },
);
