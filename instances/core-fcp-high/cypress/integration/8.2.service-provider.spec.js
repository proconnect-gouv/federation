import { getAuthorizeUrl } from './mire.utils';

describe('Service Provider', () => {
  it('should trigger error Y030106 if SP is not in database', () => {
    // oidc param
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const url = getAuthorizeUrl({ client_id: 'random-bad-client-id' });
    cy.visit(url, { failOnStatusCode: false });

    cy.hasError('Y030106');
  });

  it('should trigger error Y030106 if SP is in database but disabled', () => {
    const url = getAuthorizeUrl({
      // oidc param
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id:
        '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
    });
    cy.visit(url, { failOnStatusCode: false });

    cy.hasError('Y030106');
  });

  it('should trigger error Y030118 if the parameter redirect_uri does NOT match one of the redirect uris of the SP in database', () => {
    const url = getAuthorizeUrl({
      // oidc param
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uri: 'https://my-malicious-url.fr/callback',
    });
    cy.visit(url, { failOnStatusCode: false });

    cy.hasError('Y030118');
  });
});
