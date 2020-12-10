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
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
    });
    checkInStringifiedJson(
      'sub',
      'c2a305b1162c7b0f44923049dec15ca6189ff454dde89e8a41535c291aae86f9v1',
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
      'c2a305b1162c7b0f44923049dec15ca6189ff454dde89e8a41535c291aae86f9v1',
    );
  });
});
