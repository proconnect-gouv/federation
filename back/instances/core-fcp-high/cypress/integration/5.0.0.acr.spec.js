import {
  basicScenario,
  checkInformationsConsent,
  configureSpAndClickFc,
} from './mire.utils';

/**
 * @todo #242 - remove and let basic scopes
 */
const scopes = [
  'openid',
  'gender',
  'birthdate',
  'birthcountry',
  'birthplace',
  'given_name',
  'family_name',
  'email',
  'preferred_username',
  'address',
  'phone',
];

describe('5.0.0 - Acr', () => {
  it('should access to FI when acr from SP is unique and known', () => {
    basicScenario({
      idpId: 'fip1-high',
      // Oidc naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      scopes,
    });

    // FC: Read confirmation message
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);
    checkInformationsConsent(scopes);
  });

  it('should access to FI when acr from SP has multiple values and all are known', () => {
    basicScenario({
      idpId: 'fip1-high',
      // Oidc naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2 eidas3',
      scopes,
    });

    // FC: Read confirmation message
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);
    checkInformationsConsent(scopes);
  });

  it('should access to FI when acr from SP has multiple values and all are known but different order', () => {
    basicScenario({
      idpId: 'fip1-high',
      // Oidc naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas3 eidas2',
      scopes,
    });

    // FC: Read confirmation message
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);
    checkInformationsConsent(scopes);
  });

  it('should access to FI when acr from SP has multiple values and one is known', () => {
    basicScenario({
      idpId: 'fip1-high',
      // Oidc naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2 eidas666 eidas42',
      scopes,
    });

    // FC: Read confirmation message
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);
    checkInformationsConsent(scopes);
  });

  it('should access to FI when acr from SP is unique and not known', () => {
    basicScenario({
      idpId: 'fip1-high',
      // Oidc naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas666',
      scopes,
    });

    // FC: Read confirmation message
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);
    checkInformationsConsent(scopes);
  });

  it('should access to FI when acr from SP has multiple values and some are known', () => {
    basicScenario({
      idpId: 'fip1-high',
      // Oidc naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2 eidas666 eidas3',
      scopes,
    });

    // FC: Read confirmation message
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);
    checkInformationsConsent(scopes);
  });

  it('should access to FI when acr from SP has multiple values and none are known', () => {
    basicScenario({
      idpId: 'fip1-high',
      // Oidc naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas28 eidas666 eidas42',
      scopes,
    });

    // FC: Read confirmation message
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);
    checkInformationsConsent(scopes);
  });

  it('should complete cinematic even when acr is unknown and FC should force it to max value', () => {
    // setup
    const MAX_EIDAS_LEVEL = 'eidas3';

    basicScenario({
      idpId: 'fip1-high',
      // Oidc naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas666',
      scopes,
    });

    // FC: Read confirmation message :D
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);
    checkInformationsConsent(scopes);

    // FC: validate consent
    cy.get('#consent').click();

    // return to FS
    cy.url().should(
      'match',
      new RegExp(
        `${Cypress.env('SP1_ROOT_URL')}/interaction/[0-9a-z_-]+/verify`,
        'i',
      ),
    );

    cy.get('#info-acr').contains(MAX_EIDAS_LEVEL);
  });

  it('should reject when acr from SP is known but unauthorized ', () => {
    configureSpAndClickFc({
      idpId: 'fip1-high',
      // Oidc naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas1',
    });

    // FC: Read confirmation message
    cy.url()
      .should('contains', `${Cypress.env(`SP1_ROOT_URL`)}/error?`)
      .should('contains', 'error=invalid_acr')
      .should(
        'contains',
        'error_description=acr_value%20is%20not%20valid%2C%20should%20be%20equal%20one%20of%20these%20values%2C%20expected%20eidas2%2Ceidas3%2C%20got%20eidas1',
      );

    cy.get('#error-title').contains('Error: invalid_acr');
    cy.get('#error-description').contains(
      'acr_value is not valid, should be equal one of these values, expected eidas2,eidas3, got eidas1',
    );
  });

  /**
   * @todo #422 see: This section should be implemented in the IDP Mock instance (eidasLevel)
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/422
   * it('should trigger error Y020001 when acr from IdP is lower than asked', () => {
   *   basicErrorScenario({
   *     errorCode: 'test',
   *     idpId: 'fip1-high',
   *     eidasLevel: 'eidas1',
   *   });
   *
   *   cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/verify`));
   *   cy.hasError('Y020001');
   * });
   */
});
