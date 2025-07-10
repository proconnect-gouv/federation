import { ChainableElement } from '../types';
import scopes from './../../../fixtures/fca-low/scopes.json';
import { getServiceProviderByDescription } from './sp-provider-helper';
import { getDefaultUser } from './user-helper';

const defaultUserClaims = getDefaultUser();

const getUserInfo = (): ChainableElement =>
  cy.get('#userinfo').invoke('text').then(JSON.parse);

export const getUserInfoProperty = (property: string): ChainableElement =>
  getUserInfo().then((userInfo) => userInfo[property]);

export const getScopeByDescription = (description: string): string =>
  scopes.find((scope) => scope.description === description).scopes.join(' ');

export const getUserInfoSignatureAlgorithmByDescription = (
  description: string,
): string | null => {
  const serviceProvider = getServiceProviderByDescription(description);
  return serviceProvider.userinfo_signed_response_alg;
};

const nonSignedUserInfoMandatoryPatterns = {
  sub: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
}!;

const signedUserInfoMandatoryPatterns = {
  aud: /^\w+$/,
  exp: /^\d+/,
  iat: /^\d+/,
  iss: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  sub: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
};

export const checkMandatoryData = (isUserinfoSigned: boolean): void => {
  const mandatoryPatterns = isUserinfoSigned
    ? signedUserInfoMandatoryPatterns
    : nonSignedUserInfoMandatoryPatterns;
  getUserInfo().then((userInfo) => {
    Object.keys(mandatoryPatterns).forEach((key) =>
      expect(userInfo[key]).to.match(
        mandatoryPatterns[key],
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
  idpClaims: { idp_id: string; idp_acr: string },
): void => {
  const expectedScope = getScopeByDescription(expectedScopeDescription);
  const expectedClaims = getClaims(expectedScope);
  const userClaims = { ...defaultUserClaims, ...idpClaims };

  getUserInfo().then((userInfo) => {
    expectedClaims
      .filter((claimName) => claimName !== 'sub' && claimName !== 'email')
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

export const checkNoExtraClaims = (
  expectedScopeDescription: string,
  isUserinfoSigned: boolean,
): void => {
  const mandatoryData = isUserinfoSigned
    ? nonSignedUserInfoMandatoryPatterns
    : signedUserInfoMandatoryPatterns;

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
