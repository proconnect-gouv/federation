import {
  USER_ADMIN,
  LIMIT_PAGE,
} from '../../../../shared/cypress/support/constants';
import { deleteUser } from './account-delete.utils';

/**
 * The temporary password can be retrieve after the call of this function
 * using cy.get('@tmpPassword')
 */
export function createUserAccount(userInfo, basicConfiguration) {
  cy.contains('Comptes utilisateurs').click();
  cy.contains('Créer un utilisateur').click();
  cy.wait(1);

  cy.formType('#username', userInfo.username, basicConfiguration);
  cy.formType('#email', userInfo.email, basicConfiguration);

  cy.get('#tmpPassword').invoke('text').then((tmpPassword) => cy.wrap(tmpPassword).as('tmpPassword'));

  if (basicConfiguration.adminRole) {
    cy.get('form')
      .find('[id="role-admin"]')
      .check();
  }

  if (basicConfiguration.operatorRole) {
    cy.get('form')
      .find('[id="role-operator"]')
      .check();
  }

  if (basicConfiguration.securityRole) {
    cy.get('form')
      .find('[id="role-security"]')
      .check();
  }

  if (!basicConfiguration.totpNotFilled) {
    cy.totp(basicConfiguration);
  }

  // change csrf token
  if (basicConfiguration.invalidCsrf) {
    cy.get('input[name="_csrf"]').then(csrf => {
      csrf[0].value = 'obviouslyBadCSRF';
    });
  }

  cy.contains("Créer l'utilisateur").click();
}

export function createUserAndLogWith(userInfo, basicConfiguration) {
  const configuration = {
    ...basicConfiguration,
    adminRole: true,
    operatorRole: true,
    securityRole: false,
  };

  createUserAccount(userInfo, configuration);
  cy.logout(USER_ADMIN);

  cy.get('@tmpPassword').then((tmpPassword) => {
    cy.firstLogin(userInfo.username, tmpPassword);
  });

  cy.formType('#password', userInfo.password, basicConfiguration);
  cy.formType(
    '#confirm-password',
    userInfo.confirmPassword,
    basicConfiguration,
  );

  cy.get('#secret > td')
    .invoke('text')
    .then(secret =>
      cy.totp({ totp: basicConfiguration.totpFirstLogin }, secret),
    );

  if (basicConfiguration.submit) {
    cy.get('button[type="submit"]').click();
  }
}

export function deleteUserAndLogout(adminAccount, userToDelete, configuration) {
  cy.forceLogin(adminAccount.admin, adminAccount.adminPass);
  cy.visit(`/account?page=1&limit=${LIMIT_PAGE}`);
  cy.wait(1);

  deleteUser(userToDelete);
  cy.logout(adminAccount.admin);
}
