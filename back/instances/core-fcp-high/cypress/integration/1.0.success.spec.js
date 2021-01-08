import {
  basicSuccessScenario,
  checkInformationsServiceProvider,
  checkInStringifiedJson,
} from './mire.utils';

describe('Successful scenarios', () => {
  // -- replace by either `fip1v2` or `fia1v2`
  const idpId = `${Cypress.env('IDP_NAME')}1v2`;

  it('should redirect to FC website', () => {
    cy.request({
      url: `${Cypress.env('FC_ROOT_URL')}/api/v2`,
      method: 'GET',
      followRedirect: false,
    }).then((response) => {
      expect(response.status).to.eq(301);
      expect(response.headers.location).to.eq('https://franceconnect.gouv.fr');
    });
  });

  it('should log in to Service Provider Example', () => {
    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });
    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });

  it('should log in to Service Provider Example with POST /authorize', () => {
    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
      method: 'POST',
    });

    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });
    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });

  it('should log in to Service Provider, an user born in Corse 2A', () => {
    basicSuccessScenario({
      userName: 'test_CORSE_2A',
      password: '123',
      eidasLevel: 1,
      idpId,
      method: 'POST',
    });

    checkInformationsServiceProvider({
      gender: 'Homme',
      givenName: 'Mario',
      familyName: 'Brosse',
      preferredUsername: 'Mario',
      birthdate: '1981-02-03',
      birthplace: '2A004',
      birthcountry: '99100',
    });
    checkInStringifiedJson(
      'sub',
      'ee0281b8150499ba220fb914a0e6f6aaf83e4673f6ffb0e669e210fbd1612a56v1',
    );
  });

  it('should log in to Service Provider, an user born in Corse 2B', () => {
    basicSuccessScenario({
      userName: 'test_CORSE_2B',
      password: '123',
      eidasLevel: 1,
      idpId,
      method: 'POST',
    });

    checkInformationsServiceProvider({
      gender: 'Homme',
      givenName: 'Luigi',
      familyName: 'Brosse',
      preferredUsername: 'Luigi',
      birthdate: '1981-02-03',
      birthplace: '2B050',
      birthcountry: '99100',
    });
    checkInStringifiedJson(
      'sub',
      '5dc66a1463be39c00c2826e5c16e161df7d9e3f897b88e8d8f267461d2cd6680v1',
    );
  });

  it('should log in to Service Provider Example a "présumé né jour"', () => {
    basicSuccessScenario({
      userName: 'étranger_présumé_né_jour',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Homme',
      givenName: 'Jean',
      familyName: 'FLEURET',
      birthdate: '1992-11-00',
      birthcountry: '99217',
    });
    checkInStringifiedJson(
      'sub',
      '1498d9573ecba882e7038ea0407195f4f703d4e477db089e6cb3cbe723cb3b0fv1',
    );
  });

  it('should log in to Service Provider Example a "présumé né jour et mois"', () => {
    basicSuccessScenario({
      userName: 'étranger_présumé_né_jour_et_mois',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Homme',
      givenName: 'Jean',
      familyName: 'TARGE',
      birthdate: '1992-00-00',
      birthcountry: '99217',
    });
    checkInStringifiedJson(
      'sub',
      '4718dec56cbcc6f581981c4ea987f0cdd219ae955f454f530e706c5f293321c8v1',
    );
  });
});
