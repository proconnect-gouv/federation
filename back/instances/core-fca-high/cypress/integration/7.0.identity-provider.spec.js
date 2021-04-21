import {
  getAuthorizeUrl,
  getServiceProvider,
  getIdentityProvider,
} from './mire.utils';

describe('Idp activation & visibility', () => {
  // -- replace by either `fip` or `fia`
  const idpId = `${Cypress.env('IDP_NAME')}`;
  const { IDP_INTERACTION_URL } = getIdentityProvider(`${idpId}1v2`);

  const mireUrl = new RegExp('/interaction/[^/]+');

  it('should display active and visible IdP', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    cy.get('#fi-search-term').type(
      'MOCK - Ministére de la transition écologique - ALL FIS - SORT 2',
    );
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia1v2"]',
    ).should('exist');
  });

  it('should find an existing idp, case insensitive, with space, with accent', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);

    cy.get('#fi-search-term').type(
      'MOCK - Ministére de la transition écologique - ALL FIS - SORT 2',
    );

    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia1v2"]',
    ).should('exist');

    cy.contains('Identity Provider 1 - eIDAS élevé').click();
    cy.url().should('include', IDP_INTERACTION_URL);
  });

  it('should find an existing idp, case insensitive, without space', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);

    cy.get('#fi-search-term').type('mock - ministére de la');

    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia1v2"]',
    ).should('exist');

    cy.contains('Identity Provider 1 - eIDAS élevé').click();
    cy.url().should('include', IDP_INTERACTION_URL);
  });

  it('should find an existing idp, case insensitive, without accent', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);

    cy.get('#fi-search-term').type('mock - ministere de la');

    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia1v2"]',
    ).should('exist');

    cy.contains('Identity Provider 1 - eIDAS élevé').click();
    cy.url().should('include', IDP_INTERACTION_URL);
  });

  it('should display an error message if no idp matches search', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);

    cy.get('#fi-search-term').type('I do not exist');

    cy.get('#identity-provider-search input[name="providerUid"]').should(
      'not.exist',
    );

    cy.contains("Aucun fournisseur d'identités n'a été trouvé").should(
      'be.visible',
    );
  });

  it('should display as disable "not active but visible" IdP', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    cy.get('#fi-search-term').type(
      'MOCK - Ministére de la transition écologique - ALL FIS - SORT 2',
    );
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia-desactive-visible"]',
    ).should('exist');
  });

  /**
   * @TODO #414 Implement tests once feature is implemented in core-fca (front + fixture)
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/414
   */
  it('should not do anything when click on disabled IdP', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    cy.get('#fi-search-term').type(
      'MOCK - Ministére de la transition écologique - ALL FIS - SORT 2',
    );
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia-desactive-visible"]',
    )
      .first()
      .next()
      .click({ force: true });
    cy.url().should('match', mireUrl);
  });

  it('should redirect when click on enabled IdP', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    cy.get('#fi-search-term').type(
      'MOCK - Ministére de la transition écologique - ALL FIS - SORT 2',
    );
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia1v2"]',
    )
      .first()
      .next()
      .click();
    cy.url().should(
      'contain',
      getIdentityProvider('fia1v2').IDP_INTERACTION_URL,
    );
  });

  it('should trigger error 020017 when forging click on disabled IdP', () => {
    cy.visit(getAuthorizeUrl());
    cy.url().should('match', mireUrl);
    cy.get('#fi-search-term').type(
      'MOCK - Ministére de la transition écologique - ALL FIS - SORT 2',
    );
    cy.get(
      '#identity-provider-search input[name="providerUid"][value="fia-desactive-visible"]',
    )
      .first()
      .next()
      .invoke('attr', 'disabled', false)
      .click();

    cy.url().should('contain', '/api/v2/redirect-to-idp');
  });

  // TODO -> find how to update ministry
  describe('No app restart needed', () => {
    const spId = `${Cypress.env('SP_NAME')}1v2`;

    beforeEach(() => {
      cy.resetdb();
    });

    it('should display a ministry that has been added without an app restart needed', () => {
      const { SP_ROOT_URL } = getServiceProvider(spId);
      cy.visit(SP_ROOT_URL);
      cy.get('#get-authorize').click();
      cy.get('#fi-search-term').type(
        'MOCK - Ministére de la transition écologique - ALL FIS - SORT 2',
      );
      cy.get('#identity-provider-result').should(
        'not.contain',
        'Idp test Inserted',
      );
      cy.e2e('fca_idp_insert');
      cy.wait(500);
      cy.reload();
      cy.get('#fi-search-term').type('ministere');
      cy.get('#identity-provider-search').contains('Idp test Inserted');
    });

    it('should update an identity provider properties, activate it, without an app restart needed', () => {
      const { SP_ROOT_URL } = getServiceProvider(spId);
      cy.visit(SP_ROOT_URL);
      cy.get('#get-authorize').click();
      cy.get('#fi-search-term').type(
        'MOCK - Ministére de la transition écologique - ALL FIS - SORT 2',
      );
      cy.get('#identity-provider-search').should(
        'not.contain',
        'Idp test Updated, activated',
      );

      cy.e2e('fca_idp_insert');
      cy.e2e('fca_idp_update_activate');
      cy.wait(500);
      cy.reload();
      cy.get('#fi-search-term').type('ministere');
      cy.get('#identity-provider-search').contains(
        'Idp test Updated, activated',
      );
    });

    it('should update an identity provider properties, deactivate it, without an app restart needed', () => {
      const { SP_ROOT_URL } = getServiceProvider(spId);
      cy.visit(SP_ROOT_URL);
      cy.get('#get-authorize').click();
      cy.get('#fi-search-term').type(
        'MOCK - Ministére de la transition écologique - ALL FIS - SORT 2',
      );
      cy.get('#identity-provider-search').should(
        'not.contain',
        'Idp test Updated, desactivated',
      );

      cy.e2e('fca_idp_insert');
      cy.e2e('fca_idp_update_activate');
      cy.e2e('fca_idp_update_desactivate');
      cy.wait(500);
      cy.reload();

      cy.get('#fi-search-term').type(
        'MOCK - Ministére de la transition écologique - ALL FIS - SORT 2',
      );
      cy.get('#identity-provider-search').contains(
        'Idp test Updated, desactivated',
      );
    });

    it('should remove an identity provider without an app restart needed', () => {
      const { SP_ROOT_URL } = getServiceProvider(spId);
      cy.visit(SP_ROOT_URL);
      cy.get('#get-authorize').click();
      cy.get('#fi-search-term').type(
        'MOCK - Ministére de la transition écologique - ALL FIS - SORT 2',
      );
      cy.get('#identity-provider-search').should(
        'not.contain',
        'Idp test Inserted',
      );

      cy.e2e('fca_idp_insert');
      cy.wait(500);
      cy.reload();

      cy.e2e('fca_idp_remove');
      cy.wait(500);
      cy.reload();

      cy.get('#fi-search-term').type(
        'MOCK - Ministére de la transition écologique - ALL FIS - SORT 2',
      );
      cy.get('#identity-provider-search').should(
        'not.contain',
        'Idp test Inserted',
      );
    });
  });
});
