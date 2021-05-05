export default class IdentityProviderPage {
  userNameSelector: string;
  passwordSelector: string;
  submitButtonSelector: string;
  originUrl: string;

  constructor(args) {
    const {
      selectors: { password, submitButton, userName },
      url,
    } = args;
    this.userNameSelector = userName;
    this.passwordSelector = password;
    this.submitButtonSelector = submitButton;
    this.originUrl = url;
  }

  visit() {
    cy.visit(this.originUrl);
  }

  checkIsVisible() {
    cy.url().should('include', this.originUrl);
  }

  login(userCredentials) {
    const { password, userName } = userCredentials;
    cy.get(this.userNameSelector).clear().type(userName);
    cy.get(this.passwordSelector).clear().type(password, { log: false });
    cy.get(this.submitButtonSelector).click();
  }
}
