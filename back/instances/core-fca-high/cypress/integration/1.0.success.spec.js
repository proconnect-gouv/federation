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
      givenName: 'Angela Claire Louise',
      usualName: 'DUBOIS',
    });
    checkInStringifiedJson(
      'sub',
      'c2a305b1162c7b0f44923049dec15ca6189ff454dde89e8a41535c291aae86f9v1',
    );
  });

  it('should return to the SP with an "invalid_request" error if the query does not contain the "openid" scope', () => {
    const { SP_ROOT_URL } = getServiceProvider(`${Cypress.env('SP_NAME')}1v2`);
    // First visit SP home page to initialize its session.
    cy.visit(SP_ROOT_URL);
    const url = getAuthorizeUrl({
      scope: 'given_name',
    })

    // Visit forged /authorize URL
    cy.visit(url, {
      failOnStatusCode: false,
    });

    cy.url()
    .should(
      'contains',
      `${SP_ROOT_URL}/oidc-callback/envIssuer`,
    )
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
      'c2a305b1162c7b0f44923049dec15ca6189ff454dde89e8a41535c291aae86f9v1',
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
      'c2a305b1162c7b0f44923049dec15ca6189ff454dde89e8a41535c291aae86f9v1',
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
      'c2a305b1162c7b0f44923049dec15ca6189ff454dde89e8a41535c291aae86f9v1',
    );
  });
});
