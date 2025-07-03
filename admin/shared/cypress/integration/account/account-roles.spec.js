import {
  USER_OPERATOR,
  USER_ONLY_ADMIN,
  USER_SECURITY,
  USER_PASS,
  LIMIT_PAGE,
} from '../../../../shared/cypress/support/constants';

describe('Account', () => {
  before(() => cy.resetEnv('postgres'));
  it('should redirect the not connected user to https://fc-exploitation.docker.dev-franceconnect.fr/login', () => {
    cy.visit(`/account`);
    cy.url().should('contain', `/login`);
  });

  describe('User has the OPERATOR role', () => {
    beforeEach(() => {
      cy.login(USER_OPERATOR, USER_PASS);
      cy.contains('Comptes utilisateurs').click();
    });

    it('checking account page is well displayed', () => {
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.get('tbody th').then(userRows => {
        expect(userRows.length).to.be.greaterThan(0);
      });

      cy.get('#users-count').then(users => {
        const sentence = users[0].innerText.split(' ');
        const number = parseInt(sentence[0], 10);

        expect(number).to.be.a('number');
      });
    });

    it("should'nt give access to deletion buttons inside account list", () => {
      cy.get('form[name="deleteForm"]').should('not.exist');
    });
  });

  describe('User has the ADMIN role', () => {
    it('should redirect the user who has just the admin role to the account list page when he connects himself', () => {
      cy.forceLogin(USER_ONLY_ADMIN, USER_PASS);

      cy.url().should('contain', `/account`);
      cy.contains('Gestion des utilisateurs');
      cy.contains('Fournisseurs de service').should('not.exist');
      cy.contains("Fournisseurs d'identité").should('not.exist');
      cy.get('form[name="deleteForm"]').should('exist');
    });
  });

  describe('User has the SECURITY role', () => {
    beforeEach(() => {
      cy.login(USER_SECURITY, USER_PASS);
    });

    it('should land on his post login page', () => {
      cy.url().should('contain', `${Cypress.env('APP_HOME_ROLE_SECURITY')}`);
    });

    it('should not be able to make any create, update or delete actions', () => {
      cy.contains(USER_SECURITY);

      // l'utilisateur ne voit pas les liens suivants dans exploit, et à fortiori dans les autres app
      // l'utilisateur ne voit pas RNIPP dans support
      cy.contains('Scopes et claims').should('not.exist');
      cy.contains('Configuration').should('not.exist');

      // l'utilisateur ne voit pas les liens suivants dans stats, et à fortiori dans les autres app
      cy.contains('Évènements').should('not.exist');
      cy.contains('Métriques').should('not.exist');

      cy.get('body nav ul li').each(elem => {
        const tab = elem[0].innerText;
        cy.contains(tab).click();
        cy.get('.btn-action-update', { timeout: 0 }).should('not.exist');
        cy.get('.btn-action_generate-client-secret', { timeout: 0 }).should(
          'not.exist',
        );
        cy.get('.btn-action-delete', { timeout: 0 }).should('not.exist');
      });
    });
  });
});
