import { IdentityProviderBase, UserCredentials } from '../../common/types';

export default class IdentityProviderPage {
  userNameSelector: string;
  passwordSelector: string;
  submitButtonSelector: string;
  originUrl: string;

  constructor(args: IdentityProviderBase) {
    const {
      selectors: { password, submitButton, userName },
      url,
    } = args;
    this.userNameSelector = userName;
    this.passwordSelector = password;
    this.submitButtonSelector = submitButton;
    this.originUrl = url;
  }

  visit(): void {
    cy.visit(this.originUrl);
  }

  checkIsVisible(): void {
    cy.url().should('include', this.originUrl);
  }

  setMockAcrValue(acrValue: string): void {
    cy.get('[name="acr"]').select(acrValue);
  }

  login(userCredentials: UserCredentials): void {
    const { password, userName } = userCredentials;
    cy.get(this.userNameSelector).clear().type(userName);
    cy.get(this.passwordSelector).clear().type(password, { log: false });
    cy.get(this.submitButtonSelector).click();
  }
}
