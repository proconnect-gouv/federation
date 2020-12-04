import {
  basicSuccessScenario,
  checkInformations,
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

    checkInformations({
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

    checkInformations({
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

  it('should log in to Service Provider Example a "présumé né jour"', () => {
    basicSuccessScenario({
      userName: 'étranger_présumé_né_jour',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    checkInformations({
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

    checkInformations({
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
