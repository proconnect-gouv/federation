const scopeAttributes = [
  'openid',
  'profile',
  'gender',
  'birthdate',
  'birthcountry',
  'birthplace',
  'given_name',
  'family_name',
  'email',
  'preferred_username',
  'address',
  'phone',
  'birth',
  'identite_pivot',
];

export default class ServiceProviderPage {
  fcButtonSelector: string;
  logoutButtonSelector: string;
  originUrl: string;

  constructor(args) {
    const {
      selectors: { fcButton, logoutButton },
      url,
    } = args;
    this.fcButtonSelector = fcButton;
    this.logoutButtonSelector = logoutButton;
    this.originUrl = url;
  }

  get fcButton() {
    return cy.get(this.fcButtonSelector);
  }

  get logoutButton() {
    return cy.get(this.logoutButtonSelector);
  }

  visit() {
    cy.visit(this.originUrl);
  }

  checkIsVisible() {
    cy.url().should('include', this.originUrl);
  }

  checkIsUserConnected(isConnected = true) {
    if (isConnected) {
      this.logoutButton.should('be.visible');
    } else {
      this.logoutButton.should('not.exist');
    }
  }

  setMockRequestedScope(requestedScope) {
    scopeAttributes
      .filter((attribute) => !['openid'].includes(attribute))
      .forEach((attribute) => {
        const attributeRequested = requestedScope.attributes.includes(
          attribute,
        );
        if (attributeRequested) {
          cy.get(`#scope_${attribute}`).check();
        } else {
          cy.get(`#scope_${attribute}`).uncheck();
        }
      });
  }

  setMockRequestedAcr(acrValue) {
    cy.get('#acrSelector').select(acrValue);
  }

  checkMockInformationAccess(requestedScope, userDetails) {
    cy.get('#json-output')
      .invoke('text')
      .then((text) => {
        const responseBody = JSON.parse(text.trim());

        expect(responseBody.sub).to.match(/^[0-9a-f]{64}v1$/);

        scopeAttributes
          .filter((attribute) => !['openid'].includes(attribute))
          .forEach((attribute) => {
            // Not requested attribute should be undefined
            const expectedAttributeValue = requestedScope.attributes.includes(
              attribute,
            )
              ? userDetails[attribute]
              : undefined;
            expect(responseBody[attribute]).to.equal(expectedAttributeValue);
          });
      });
  }
}
