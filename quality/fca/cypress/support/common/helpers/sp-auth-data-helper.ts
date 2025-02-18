import { ChainableElement, UserClaims } from '../types';
import scopes from './../../../fixtures/fca-low/scopes.json';

const getUserInfo = (): ChainableElement =>
  cy.get('#userinfo').invoke('text').then(JSON.parse);

export const getUserInfoProperty = (property: string): ChainableElement =>
  getUserInfo().then((userInfo) => userInfo[property]);

export const getScopeByDescription = (description: string): string =>
  scopes.find((scope) => scope.description === description).scopes.join(' ');

const mandatoryData = {
  aud: /^\w+$/,
  exp: /^\d+/,
  iat: /^\d+/,
  iss: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  sub: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
};

export const checkMandatoryData = (): void => {
  getUserInfo().then((userInfo) => {
    Object.keys(mandatoryData).forEach((key) =>
      expect(userInfo[key]).to.match(
        mandatoryData[key],
        `${key} should be present.`,
      ),
    );
  });
};

const aliasScopesClaims = {
  chorusdt: ['chorusdt:matricule', 'chorusdt:societe'],
  openid: ['sub'],
  phone: ['phone_number'],
};

export const getClaims = (scope: string): string[] => {
  const claims = scope
    .split(' ')
    .map((scope: string): string =>
      aliasScopesClaims[scope] ? aliasScopesClaims[scope] : scope,
    )
    .flat();
  return [...new Set(claims)];
};

// Check the userInfo claims against the user fixtures
export const checkExpectedUserClaims = (
  expectedScopeDescription: string,
  userClaims: UserClaims,
): void => {
  const expectedScope = getScopeByDescription(expectedScopeDescription);
  const expectedClaims = getClaims(expectedScope);

  getUserInfo().then((userInfo) => {
    expectedClaims
      .filter((claimName) => claimName !== 'sub')
      .forEach((claimName) => {
        expect(userInfo[claimName]).to.deep.equal(
          userClaims[claimName],
          `The claim ${claimName} should be ${JSON.stringify(
            userClaims[claimName],
          )}`,
        );
      });
  });
};

export const checkNoExtraClaims = (expectedScopeDescription: string): void => {
  const expectedScope = getScopeByDescription(expectedScopeDescription);
  const expectedClaims = getClaims(expectedScope);

  getUserInfo().then((userInfo) => {
    const extraClaimsName = Object.keys(userInfo).filter(
      (key) => !mandatoryData[key] && !expectedClaims.includes(key),
    );
    expect(extraClaimsName).to.deep.equal(
      [],
      'No extra claims should be sent.',
    );
  });
};
