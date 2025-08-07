import pickBy from 'lodash/pickBy';

const BASE_URL = Cypress.config('baseUrl');

export function uploadCSV(filename) {
  cy.wrap({
    filename,
  })
    .its('filename')
    .should('not.to.be.empty');

  cy.url().should('eq', `${BASE_URL}/service-provider`);
  cy.contains('Créer un fournisseur de service').click();
  cy.url().should('eq', `${BASE_URL}/service-provider/create`);

  cy.get('input[name=csv-input]')
    .should('have.class', 'csv')
    .selectFile(`cypress/fixtures/csv/${filename}.csv`, { force: true });
}

export function createServiceProvider(serviceProviderInfo, configuration) {
  cy.url().should('eq', `${BASE_URL}/service-provider`);
  cy.contains('Créer un fournisseur de service').click();
  cy.contains('Section Fournisseur de données').click();

  const {
    name,
    redirectUri,
    redirectUriLogout,
    site,
    emails,
    ipAddresses,
    introspection_signed_response_alg,
    introspection_encrypted_response_alg,
    introspection_encrypted_response_enc,
    response_types,
    grant_types,
    jwks_uri,
  } = serviceProviderInfo;

  cy.formFill(
    pickBy({
      name,
      redirectUri,
      redirectUriLogout,
      site,
      emails,
      ipAddresses,
      introspection_signed_response_alg,
      introspection_encrypted_response_alg,
      introspection_encrypted_response_enc,
      response_types,
      grant_types,
      jwks_uri,
    }),
    configuration,
  );

  if (serviceProviderInfo.scopes && serviceProviderInfo.scopes.length > 0) {
    cy.get('[type="checkbox"]').check(serviceProviderInfo.scopes);
  }

  cy.get('[type="radio"]').check('public', {
    force: true,
  });

  if (serviceProviderInfo.identityConsent === true) {
    cy.get('[type="radio"]').check('private', {
      force: true,
    });

    cy.get('form')
      .find('[id="consent-required"]')
      .check('true', {
        force: true,
      });
  }

  cy.totp(configuration);
  cy.get('form[name="fs-form"] button[type="submit"]').click();
}
