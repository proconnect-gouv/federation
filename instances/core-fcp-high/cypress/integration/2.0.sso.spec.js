import { basicSuccessScenario, checkInformations } from './mire.utils';

/** @TODO Add a case with SP logout once implemented */
describe('No SSO', () => {
  // Given
  const loginInfo = {
    userName: 'test',
    password: '123',
    eidasLevel: 1,
    idpId: 'fip1v2',
  };

  const userInfos = {
    gender: 'Femme',
    givenName: 'Angela Claire Louise',
    familyName: 'DUBOIS',
    birthdate: '1962-08-24',
    birthplace: '75107',
    birthcountry: '99100',
  };
  it('should require full cinematic to login another SP', () => {
    // When
    //   ...Log into SP "A"
    basicSuccessScenario(loginInfo);
    checkInformations(userInfos);

    //   ...Then log  into SP "B"
    basicSuccessScenario({ ...loginInfo, sp: Cypress.env('UD2V2_ROOT_URL') });

    // Then
    checkInformations(userInfos);
  });
  it('should run the whole cinematic all the times even for the same SP', () => {
    // When
    //   ...Log into SP
    basicSuccessScenario(loginInfo);
    checkInformations(userInfos);
    //   ...Logout from SP
    cy.get('a.nav-logout').click();
    cy.contains(
      `Vous devez vous authentifier afin d'accéder à vos données personnelles.`,
    );
    //   ...Log again into SP
    basicSuccessScenario(loginInfo);

    // Then
    checkInformations(userInfos);
  });
});
