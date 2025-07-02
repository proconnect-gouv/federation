import {
  USER_ADMIN,
  USER_PASS,
  LIMIT_PAGE,
} from '../../../../shared/cypress/support/constants';

import { deleteUser } from './account-delete.utils';
import { createUserAccount } from './account-create.utils';

describe('Account', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    cy.resetEnv('postgres');
  });
  describe('Delete user', () => {
    const userInfo = {
      username: 'cypress',
      email: 'cypress@email.com',
    };

    const basicConfiguration = {
      adminRole: true,
      operatorRole: true,
      fast: true,
    };
    beforeEach(() => {
      cy.login(USER_ADMIN, USER_PASS);
      cy.clearBusinessLog();
    });

    it('Should delete the user if confirm button is clicked and should be kept on the accounts list page after', () => {
      createUserAccount(userInfo, basicConfiguration);

      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      deleteUser(userInfo.username);

      cy.contains(
        `Le compte ${userInfo.username} a été supprimé avec succès !`,
      ).should('be.visible');
      cy.url().should('contain', `/account`);
      cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
      cy.get(`#${userInfo.username}`, { timeout: 0 }).should('not.exist');

      cy.hasBusinessLog({
        entity: 'user',
        action: 'delete',
        user: USER_ADMIN,
        name: userInfo.email,
      });
    });

    describe('Should not delete the user', () => {
      it('If cancel button is clicked in the modal confirmation', () => {
        createUserAccount(userInfo, basicConfiguration);

        cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
        deleteUser(userInfo.username, false);

        cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
        cy.contains(`${userInfo.username}`).should('be.visible');

        deleteUser(userInfo.username);
      });

      it('If the csrf token is invalid', () => {
        createUserAccount(userInfo, basicConfiguration);

        cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
        cy.get(
          `form[data-element-title="${userInfo.username}"] input[name="_csrf"]`,
        ).then(user => {
          user[0].value = 'obviouslyBadCSRF';
        });

        deleteUser(userInfo.username);

        cy.contains('Error - 500').should('be.visible');

        cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
        deleteUser(userInfo.username);
      });

      it('If totp is not correct or empty', () => {
        createUserAccount(userInfo, basicConfiguration);

        cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
        cy.get(
          `form[data-element-title="${userInfo.username}"] button.btn-action-delete`,
        ).click();
        cy.wait(500);
        cy.contains(`Voulez-vous supprimer le compte ${userInfo.username} ?`);
        cy.contains('Confirmer').click();
        cy.contains(`Le TOTP n'a pas été saisi`).should('be.visible');
        cy.get('#totpModal').type('000000');
        cy.contains('Confirmer').click();
        cy.wait(500);
        cy.contains(`Le TOTP saisi n'est pas valide`).should('be.visible');
        cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
        cy.contains(`${userInfo.username}`).should('be.visible');

        deleteUser(userInfo.username);
      });
    });
  });
});
