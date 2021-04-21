import {beforeSuccessScenario, afterSuccessScenario, basicSuccessScenario, checkInformations } from './mire.utils';

describe('No SSO', () => {
  // Given
  // -- replace by either `fip1v2` or `fia1v2`
  const idpId = `${Cypress.env('IDP_NAME')}1v2`;

  const loginInfo = {
    userName: 'test',
    password: '123',
    eidasLevel: 1,
    idpId,
  };

  const userInfos = {
    givenName: 'Angela Claire Louise',
    usualName: 'DUBOIS',
  };
  it('should require full cinematic to login another SP', () => {
    // When
    //   ...Log into SP "A"
    //
    beforeSuccessScenario(loginInfo);
    basicSuccessScenario(loginInfo.idpId);
    afterSuccessScenario(loginInfo);

    checkInformations(userInfos);

    //   ...Then log  into SP "B"
    const params = {
      ...loginInfo,
      sp: `${Cypress.env('SP_NAME')}2v2`,
    };
    beforeSuccessScenario(params);
    basicSuccessScenario(params.idpId);
    afterSuccessScenario(params);

    // Then
    checkInformations(userInfos);
  });
  it('should run the whole cinematic all the times even for the same SP', () => {
    // When
    //   ...Log into SP
    beforeSuccessScenario(loginInfo);
    basicSuccessScenario(loginInfo.idpId);
    afterSuccessScenario(loginInfo);

    checkInformations(userInfos);
    //   ...Logout from SP
    cy.get('a.nav-logout').click();
    cy.contains(
      `Vous devez vous authentifier afin d'accéder à vos données personnelles.`,
    );

    //   ...Log again into SP
    beforeSuccessScenario(loginInfo);
    basicSuccessScenario(loginInfo.idpId);
    afterSuccessScenario(loginInfo);

    // Then
    checkInformations(userInfos);
  });
});
