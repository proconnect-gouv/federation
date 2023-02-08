import {
  ChainableElement,
  ScopeContext,
  ServiceProviderBase,
  UserClaims,
} from '../../common/types';
import { getClaims } from '../helpers';

export default class ServiceProviderPage {
  clientId: string;
  fcButtonSelector: string;
  logoutButtonSelector: string;
  mocked: boolean;
  originUrl: string;
  redirectUri: string;

  constructor(args: ServiceProviderBase) {
    const {
      clientId,
      mocked,
      redirectUri,
      selectors: { fcButton, logoutButton },
      url,
    } = args;
    this.clientId = clientId;
    this.fcButtonSelector = fcButton;
    this.logoutButtonSelector = logoutButton;
    this.mocked = mocked;
    this.originUrl = url;
    this.redirectUri = redirectUri;
  }

  isLegacySPMock(): boolean {
    // Only Legacy SP mocks have clientId and redirectUri in the fixtures
    return this.mocked && !!this.clientId && !!this.redirectUri;
  }

  getFcButton(): ChainableElement {
    return cy.get(this.fcButtonSelector);
  }

  getLogoutButton(): ChainableElement {
    return cy.get(this.logoutButtonSelector);
  }

  checkIsVisible(): void {
    cy.url().should('include', this.originUrl);
  }

  checkIsUserConnected(isConnected = true): void {
    const state = isConnected ? 'be.visible' : 'not.exist';
    this.getLogoutButton().should(state);
  }

  // Initiate FC connection using Legacy SP mock
  callAuthorize(
    fcRootUrl: string,
    scopeContext: ScopeContext,
    acrValues = 'eidas1',
  ): void {
    const { scopes = [] } = scopeContext;

    const qs = {
      acr_values: acrValues,
      client_id: this.clientId,
      nonce: 'noncefortestsBDD',
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: Array.isArray(scopes) ? scopes.join(' ') : scopes,
      state: 'testsBDD',
    };

    cy.visit(`${fcRootUrl}/api/v1/authorize`, {
      failOnStatusCode: false,
      qs,
    });
  }

  // Setup and initiate FC connection using core v2 SP mock

  setMockAuthorizeHttpMethod(formMethod: 'get' | 'post'): void {
    cy.get('#httpMethod').select(formMethod);
  }

  setMockRequestedScope(scopeContext?: ScopeContext): void {
    if (scopeContext) {
      cy.get('input[name="scope"]').clear();
      const { scopes = [] } = scopeContext;
      const scopeValue = scopes.join(' ');
      if (scopeValue) {
        cy.get('input[name="scope"]').type(scopeValue);
      }
    }
  }

  setMockRequestedAcr(acrValue: string): void {
    cy.get('input[name="acr_values"]').clear().type(acrValue);
  }

  setMockRequestedAmr(isRequested: boolean): void {
    if (isRequested) {
      cy.get('#claim_amr').check();
    } else {
      cy.get('#claim_amr').uncheck();
    }
  }

  startLogin(fcRootUrl: string, scopeContext: ScopeContext): void {
    // Initiate FS connection from Legacy SP mock
    if (this.isLegacySPMock()) {
      this.callAuthorize(fcRootUrl, scopeContext);
      return;
    }
    // Initiate FS connection from SP mock
    if (this.mocked) {
      this.setMockRequestedScope(scopeContext);
    }
    this.getFcButton().click();
  }

  logout(): void {
    this.getLogoutButton().click();
    if (this.isLegacySPMock()) {
      // 2 clicks required on Legacy SP mock
      cy.get('#fconnect-access .logout a').click();
    }
  }

  checkMockInformationAccess(
    requestedScope: ScopeContext,
    userClaims: UserClaims,
  ): void {
    const expectedClaims = getClaims(requestedScope);
    cy.get('#json-output')
      .invoke('text')
      .then((text) => {
        const responseBody = JSON.parse(text.trim());

        // Check mandatory data
        const mandatoryData = {
          aud: /^\w+$/,
          exp: /^\d+/,
          iat: /^\d+/,
          iss: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
          sub: /^[0-9a-f]{64}v1$/,
        };
        Object.keys(mandatoryData).forEach((key) =>
          expect(responseBody[key]).to.match(
            mandatoryData[key],
            `${key} should be present.`,
          ),
        );

        // Check expected claims (except sub)
        expectedClaims
          .filter((claimName) => claimName !== 'sub')
          .forEach((claimName) => {
            expect(responseBody[claimName]).to.deep.equal(
              userClaims[claimName],
              `The claim ${claimName} should be ${JSON.stringify(
                userClaims[claimName],
              )}`,
            );
          });

        // Check no extra claims
        const extraClaimsName = Object.keys(responseBody).filter(
          (key) => !mandatoryData[key] && !expectedClaims.includes(key),
        );
        expect(extraClaimsName).to.deep.equal(
          [],
          'No extra claims should be sent.',
        );
      });
  }

  checkMockAcrValue(acrValue: string): void {
    cy.get('[id="info-acr"] strong').contains(acrValue);
  }

  checkMockAmrValue(amrValue: string): void {
    cy.get('[id="info-amr"] strong').contains(amrValue);
  }

  checkMockErrorCallback(): void {
    const errorCallbackURL = `${this.originUrl}/error`;
    cy.url().should('include', errorCallbackURL);
  }

  checkMockErrorCode(errorCode: string): void {
    const encodedError = encodeURIComponent(errorCode);
    cy.url().should(
      'match',
      new RegExp(`(?<=[&|?])error=${encodedError}(?=&|$)`),
    );
  }

  checkMockErrorDescription(errorDescription: string): void {
    const encodedDescription = encodeURIComponent(errorDescription);
    cy.url().should(
      'match',
      new RegExp(`(?<=[&|?])error_description=${encodedDescription}(?=&|$)`),
    );
  }
}
