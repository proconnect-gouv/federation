import {
  ChainableElement,
  ScopeContext,
  ServiceProviderBase,
  UserClaims,
} from '../../common/types';
import { getClaims } from '../helpers';

const ALL_SCOPES: Readonly<string[]> = [
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
  redirectUriPath: string;

  constructor(args: ServiceProviderBase) {
    const {
      redirectUriPath,
      selectors: { fcButton, logoutButton },
      url,
    } = args;
    this.fcButtonSelector = fcButton;
    this.logoutButtonSelector = logoutButton;
    this.originUrl = url;
    this.redirectUriPath = redirectUriPath;
  }

  get fcButton(): ChainableElement {
    return cy.get(this.fcButtonSelector);
  }

  get logoutButton(): ChainableElement {
    return cy.get(this.logoutButtonSelector);
  }

  visit(): void {
    cy.visit(this.originUrl);
  }

  checkIsVisible(): void {
    cy.url().should('include', this.originUrl);
  }

  checkIsUserConnected(isConnected = true): void {
    if (isConnected) {
      this.logoutButton.should('be.visible');
    } else {
      this.logoutButton.should('not.exist');
    }
  }

  setMockRequestedScope(scopeContext: ScopeContext): void {
    const { scopes: requestedScopes } = scopeContext;

    ALL_SCOPES.filter((scope) => 'openid' !== scope).forEach((scope) => {
      const isRequested = requestedScopes.includes(scope);
      if (isRequested) {
        cy.get(`#scope_${scope}`).check();
      } else {
        cy.get(`#scope_${scope}`).uncheck();
      }
    });
    // Add extra scope directly in the text input
    requestedScopes
      .filter((scope) => !ALL_SCOPES.includes(scope))
      .forEach((scope) => {
        /**
         * @todo Need refactor after FC-532 fusion of 2 forms on FS mock page
         * author: Nicolas
         * date: 12/05/2021
         */
        cy.get('input[name="scope"]').first().type(` ${scope}`);
      });
  }

  setMockRequestedAcr(acrValue: string): void {
    cy.get('#acrSelector').select(acrValue);
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

  checkMockErrorCallback(): void {
    cy.url().should('include', `${this.originUrl}/error`);
  }

  checkMockErrorCode(errorCode: string): void {
    cy.url().should(
      'match',
      new RegExp(`(?<=[&|?])error=${encodeURI(errorCode)}(?=&|$)`),
    );
  }

  checkMockErrorDescription(errorDescription: string): void {
    cy.url().should(
      'match',
      new RegExp(
        `(?<=[&|?])error_description=${encodeURI(errorDescription)}(?=&|$)`,
      ),
    );
  }
}
