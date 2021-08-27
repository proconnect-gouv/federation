import {
  basicErrorScenario,
  basicScenario,
  getAuthorizeUrl,
  getIdentityProvider,
} from './mire.utils';

describe('10.0 - Error Management', () => {
  const idpId = `${Cypress.env('IDP_NAME')}1-high`;
  const mireUrl = new RegExp('/interaction/[^/]+');

  it('should not have link to error management after wrong client_id in authorize', () => {
    const url = getAuthorizeUrl({
      // oidc naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: 'WrongClientID',
    });
    cy.visit(url, {
      failOnStatusCode: false,
    });

    cy.get('.previous-link').should('not.exist');
  });

  it('should not have link to error management after redirect_uri in authorize', () => {
    const url = getAuthorizeUrl({
      // oidc naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uri: 'WrongRedirect_uri',
    });
    cy.visit(url, {
      failOnStatusCode: false,
    });

    cy.get('.previous-link').should('not.exist');
  });

  it('should redirect to Sp after Idp crashed', () => {
    const idpInfo = getIdentityProvider(idpId);
    cy.registerProxyURL(`${idpInfo.IDP_ROOT_URL}/user/authorize?*`, {
      scope: 'openid first_name',
    });

    basicScenario({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      idpId,
    });

    cy.proxyURLWasActivated();

    cy.hasError('Y000006');
    cy.get('#error-message').contains(
      `Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous`,
    );

    cy.get('.previous-link').should('exist');
    cy.get('.previous-link').contains('Revenir sur FSP - FSP1-HIGH');

    cy.get('.previous-link-container')
      .invoke('attr', 'href')
      .then(($link) => {
        cy.log($link);
      });
    cy.get('.previous-link').click();

    cy.url().should(
      'contains',
      '//fsp1-high.docker.dev-franceconnect.fr/error?error=Y000006',
    );
    cy.get('#error-title').contains(
      `Error: Y000006`,
    );
    cy.get('#error-description').contains(
      `Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous`,
    );
  });

  it('should redirect to Sp if we select an invalid Idp', () => {
    const url = getAuthorizeUrl();
    cy.visit(url);

    /**
     * intentionally blacklisted to create a false error
     */
    cy.get(`#fs-request-${idpId}`).within(() => {
      cy.get('input[name="providerUid"]').invoke('attr', 'value', 'fip7-high');
      cy.get(`button#idp-${idpId}`).click();
    });

    cy.hasError('Y020019');
    cy.get('#error-message').contains(
      'Ce fournisseur d\'identité est inconnu',
    );

    cy.get('.previous-link').should('exist');
    cy.get('.previous-link').contains('Revenir sur FSP - FSP1-HIGH');

    cy.get('.previous-link').click();

    cy.url().should(
      'contains',
      '/error?error=Y020019&error_description=Ce%20fournisseur%20d%27identit%C3%A9%20est%20inconnu&state=stateTraces',
    );
  });

  it('should redirect to Sp if the session failed', () => {
    basicErrorScenario({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      errorCode: 'test',
      idpId,
    });

    cy.clearCookies();

    cy.get('#consent').click();

    cy.hasError('Y190001');
    cy.get('#error-message').contains(
      'Votre session a expiré ou est invalide, fermez l’onglet de votre navigateur et reconnectez-vous',
    );

    cy.get('.previous-link').should('not.exist');
  });

  it('shoudld redirect to the good sp if we are already a locals session defined', () => {
    // Initialize a session with sp1 information
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);


    // Generate error on authorize
    const url = getAuthorizeUrl({
      // Oidc convention name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: 'random-bad-client-id'
    })
    cy.visit(url, {
      failOnStatusCode: false,
    });
    cy.hasError('Y030106');

    cy.get('.previous-link').should('not.exist');
  })
});
