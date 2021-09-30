import {
  configureSpAndClickFc,
  setFSAuthorizeAcr,
  submitFSAuthorizeForm,
} from './mire.utils';

describe('1.3 - get user consent', () => {
  beforeEach(() => {
    cy.clearBusinessLog();
  });

  it('should ask for user consent to pursue connexion if the service provider is private and the consent required', () => {
    cy.visit(Cypress.env('SP5_ROOT_URL'));

    setFSAuthorizeAcr('eidas2');
    submitFSAuthorizeForm();
    cy.get('#idp-fip1-high-title').click();
    cy.get('form').submit();
    cy.get('#fc-ask-consent')
      .should('exist')
      .contains(
        "J'accepte que FranceConnect transmette mes données au service pour me connecter.",
      );
    cy.get('#consent').should('be.disabled');
    cy.get('#fc-ask-consent input').check();
    cy.get('#consent').should('not.be.disabled');
    cy.get('#consent').click();
    cy.hasBusinessLog({
      event: 'FC_DATATRANSFER:CONSENT:IDENTITY',
      idpId: 'fip1-high',
    });
    cy.get('.nav-logout').click();
  });

  it('should not ask for user consent to pursue connexion if the service provider is private but consent not required', () => {
    cy.visit(Cypress.env('SP6_ROOT_URL'));
    setFSAuthorizeAcr('eidas2');
    submitFSAuthorizeForm();
    cy.get('#idp-fip1-high-title').click();
    cy.get('form').submit();
    cy.get('#fc-ask-consent').should('not.exist');
    cy.get('#consent').should('not.be.disabled').click();

    cy.hasBusinessLog({
      event: 'FC_DATATRANSFER:INFORMATION:IDENTITY',
      idpId: 'fip1-high',
    });
    cy.get('.nav-logout').click();
  });

  it('should not ask for user consent to pursue connexion if the service provider is public', () => {
    cy.visit(Cypress.env('SP1_ROOT_URL'));
    setFSAuthorizeAcr('eidas2');
    submitFSAuthorizeForm();
    cy.get('#idp-fip1-high-title').click();
    cy.get('form').submit();
    cy.get('#fc-ask-consent').should('not.exist');
    cy.get('#consent').should('not.be.disabled').click();
    cy.hasBusinessLog({
      event: 'FC_DATATRANSFER:INFORMATION:IDENTITY',
      idpId: 'fip1-high',
    });
    cy.get('.nav-logout').click();
  });

  it('should create an anonymous connexion if only openid is required as scope', () => {
    // Anonymous scope
    const scopes = [
      'openid'
    ];

    configureSpAndClickFc({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      sp: 'SP1',
      method: 'GET',
      scopes,
    });

    cy.get('#idp-fip1-high-title').click();
    cy.get('form').submit();

    cy.get('main section .section__identity')
      .should('exist')
      .contains('Vous avez été connecté de façon anonyme');

    cy.get('#consent').should('not.be.disabled').click();

    cy.hasBusinessLog({
      event: 'FC_DATATRANSFER:INFORMATION:ANONYMOUS',
      idpId: 'fip1-high',
    });
  });
});
