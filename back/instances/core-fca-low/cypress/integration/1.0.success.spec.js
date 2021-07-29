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
  '9aeda75d9da1edba7051a7d16e413a72d5206f16cf68c5872dd4894558dde16a';

describe('Successful scenarios', () => {
  // -- replace by either `fip1-high` or `fia1-low`
  const idpId = `${Cypress.env('IDP_NAME')}1-low`;

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
    const { SP_ROOT_URL } = getServiceProvider(`${Cypress.env('SP_NAME')}1-low`);
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
      .should('contains', `${SP_ROOT_URL}/error`)
      .should('contains', 'error=invalid_request')
      .should(
        'contains',
        'error_description=openid%20scope%20must%20be%20requested%20when%20using%20the%20acr_values',
      );
  });

  it('should log in to Service Provider Example with IDP HS256 alg and response not encrypted', () => {
    const params = {
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'fia2-low',
      sp: `${Cypress.env('SP_NAME')}4-low`,
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
      'e7c818d230bf4974c052d381273754e71aab72a31b35b6b2f4dec8909d5034f2',
    );
  });

  it('should log in to Service Provider Example with IDP HS256 alg and response encrypted', () => {
    const params = {
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'fia4-low',
      sp: `${Cypress.env('SP_NAME')}4-low`,
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
      'b2f17952c6bcf540023532988374d12ca1a79559b298e9625fec8d93c85a5b2e',
    );
  });

  it('should log in to Service Provider Example with IDP RS256 alg and response encrypted', () => {
    const params = {
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'fia5-low',
      sp: `${Cypress.env('SP_NAME')}4-low`,
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
      'e4acbd0edaf64d5a12e85586c91445b4ef5fbf1d744bdfc3ed46910b536d510c',
    );
  });
});
