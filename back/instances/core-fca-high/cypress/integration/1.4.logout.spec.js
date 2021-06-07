import {
  beforeSuccessScenario,
  basicSuccessScenario,
  afterSuccessScenario,
  checkInformations,
  checkInStringifiedJson,
  getServiceProvider,
  logout,
} from './mire.utils';

describe('RP Initiated logout scenarios', () => {
  // -- replace by either `fip1v2` or `fia1v2`
  const idpId = `${Cypress.env('IDP_NAME')}1v2`;

  it('should log out from FC+ with post logout redirect uri', () => {
    const SUB =
      '3c206a129b97806da2726d502f314a875053942ef9ce3650a2e48b17a1ddb191';

    const params = {
      userName: 'test',
      password: '123',
      idpId,
    };

    beforeSuccessScenario(params);
    basicSuccessScenario(idpId);
    afterSuccessScenario(params);

    checkInformations({
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson('sub', SUB);

    logout();

    const { SP_ROOT_URL } = getServiceProvider('fsa1v2');
    cy.url().should('include', `${SP_ROOT_URL}/`);
  });

  it('should log out from FC+ without post logout redirect uri', () => {
    const SUB =
      'f0aad5368ab513bac252935ebe2b595e254211879abb530b142069dd082ff4aa';

    const params = {
      userName: 'test',
      password: '123',
      sp: 'fsa2v2',
      idpId,
    };

    beforeSuccessScenario(params);
    basicSuccessScenario(idpId);
    afterSuccessScenario(params);

    checkInformations({
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson('sub', SUB);

    logout();

    cy.url().should(
      'include',
      `${Cypress.env('FC_ROOT_URL')}/api/v2/session/end/success`,
    );
    cy.contains(
      'Vous êtes bien déconnecté, vous pouvez fermer votre navigateur.',
    );
  });
});
