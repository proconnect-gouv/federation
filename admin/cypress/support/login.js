export function firstLogin(username, password) {
  cy.getUserActivationToken(username).then(({ stdout: activationToken }) => {
    cy.visit(`/first-login/${activationToken}`);
    cy.wait(1);
    cy.formFill({ username, password }, { fast: true });
    cy.get('button[type="submit"]').click();
  });
}

export function forceLogin(username, password) {
  cy.visit('/login');
  cy.formFill({ username, password }, { totp: true, fast: true });
  cy.get('button[type="submit"]').click();
}

export function login(username, password) {
  cy.session(
    username,
    () => {
      cy.visit('/login');
      cy.formFill({ username, password }, { totp: true, fast: true });
      cy.get('button[type="submit"]').click();
    },
    {
      cacheAcrossSpecs: true,
    },
  );
  cy.visit('/');
  cy.get('.login-form').should('not.exist');
}

export function logout(username) {
  cy.get('.dropdown-toggle')
    .contains(username)
    .click();
  cy.contains('Déconnexion').click();
}
