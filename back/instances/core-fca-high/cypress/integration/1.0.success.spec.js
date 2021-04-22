import {
  afterSuccessScenario,
  beforeSuccessScenario,
  basicSuccessScenario,
  checkInformations,
  checkInStringifiedJson,
  getAuthorizeUrl,
  getServiceProvider,
} from './mire.utils';

const BASIC_SUB =
  '3c206a129b97806da2726d502f314a875053942ef9ce3650a2e48b17a1ddb191';

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
    const params = {
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
    };
    beforeSuccessScenario(params);
    basicSuccessScenario(idpId);
    afterSuccessScenario(params);

    checkInformations({
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson('sub', BASIC_SUB);
  });

  it('should log in to Service Provider Example with POST /authorize', () => {
    const params = {
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
      method: 'POST',
    };
    beforeSuccessScenario(params);
    basicSuccessScenario(idpId);
    afterSuccessScenario(params);

    checkInformations({
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson('sub', BASIC_SUB);
  });

  it('should return to the SP with an "invalid_request" error if the query does not contain the "openid" scope', () => {
    const { SP_ROOT_URL } = getServiceProvider(`${Cypress.env('SP_NAME')}1v2`);
    // First visit SP home page to initialize its session.
    cy.visit(SP_ROOT_URL);
    const url = getAuthorizeUrl({
      scope: 'given_name',
    });

    // Visit forged /authorize URL
    cy.visit(url, {
      failOnStatusCode: false,
    });

    cy.url()
      .should('contains', `${SP_ROOT_URL}/oidc-callback/envIssuer`)
      .should('contains', 'error=invalid_request')
      .should(
        'contains',
        'error_description=openid%20scope%20must%20be%20requested%20when%20using%20the%20acr_values',
      )
      .should('contains', 'state=stateTraces');
  });

  it('should log in to Service Provider Example with IDP HS256 alg and response not encrypted', () => {
    const params = {
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'fia2v2',
      sp: `${Cypress.env('SP_NAME')}4v2`,
    };
    beforeSuccessScenario(params);
    basicSuccessScenario(params.idpId);
    afterSuccessScenario(params);

    checkInformations({
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson(
      'sub',
      'e22b76f45ef103791cd297db7878b3d88769cc5a2e5c9b442c21200cc9e266c5',
    );
  });

  it('should log in to Service Provider Example with IDP HS256 alg and response encrypted', () => {
    const params = {
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'fia4v2',
      sp: `${Cypress.env('SP_NAME')}4v2`,
    };
    beforeSuccessScenario(params);
    basicSuccessScenario(params.idpId);
    afterSuccessScenario(params);

    checkInformations({
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson(
      'sub',
      'f19ef7fbbeff0e10ada8fd0e26cee5b4d80c262bf880cca65c8e0cc5300584ca',
    );
  });

  it('should log in to Service Provider Example with IDP RS256 alg and response encrypted', () => {
    const params = {
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'fia5v2',
      sp: `${Cypress.env('SP_NAME')}4v2`,
    };
    beforeSuccessScenario(params);
    basicSuccessScenario(params.idpId);
    afterSuccessScenario(params);

    checkInformations({
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson(
      'sub',
      'c3950ef2dbb8b84eff26ed89d472b5443ffc0571859c185114bc4c536d6a4cbf',
    );
  });
});
