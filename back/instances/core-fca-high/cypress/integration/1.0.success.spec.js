import {
  basicSuccessScenario,
  checkInformations,
  checkInStringifiedJson,
  getAuthorizeUrl,
  getServiceProvider,
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
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson(
      'sub',
      '2a22df139ea8e7a81ed542150441ece7959cb870cd3a45910d0984f4e0de7524',
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
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson(
      'sub',
      '2a22df139ea8e7a81ed542150441ece7959cb870cd3a45910d0984f4e0de7524',
    );
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
    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'fia2v2',
      sp: `${Cypress.env('SP_NAME')}4v2`,
    });

    checkInformations({
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson(
      'sub',
      'a196ee2c7e788bce0e112cddbda6fb655a7edbcf1b21b35b28741be183b89dc2',
    );
  });

  it('should log in to Service Provider Example with IDP HS256 alg and response encrypted', () => {
    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'fia4v2',
      sp: `${Cypress.env('SP_NAME')}4v2`,
    });

    checkInformations({
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson(
      'sub',
      'a2f6e03b94f8bc022f2fd81bd3170f3fe7625469196d2e692e4d7e57a57d5361',
    );
  });

  it('should log in to Service Provider Example with IDP RS256 alg and response encrypted', () => {
    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId: 'fia5v2',
      sp: `${Cypress.env('SP_NAME')}4v2`,
    });

    checkInformations({
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson(
      'sub',
      '83d0a8d55426b0a397a835c2882e612d75d808ca06f47d3b79a2c1b7b24c7932',
    );
  });
});
