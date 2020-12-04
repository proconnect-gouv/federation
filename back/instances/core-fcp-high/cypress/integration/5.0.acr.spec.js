import { basicScenario } from './mire.utils';

/**
 * @todo #242 - remove and let basic scopes
 */
const scope =
  'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address phone';

describe('Acr', () => {
  it('should access to FI when acr from SP is unique and known', () => {
    basicScenario({
      idpId: 'fip1v2',
      eidasLevel: 'eidas2',
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2',
        scope,
      },
    });
  });

  it('should access to FI when acr from SP has multiple values and all are known', () => {
    basicScenario({
      idpId: 'fip1v2',
      eidasLevel: 'eidas2',
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2 eidas3',
        scope,
      },
    });
  });

  it('should access to FI when acr from SP has multiple values and all are known but different order', () => {
    basicScenario({
      idpId: 'fip1v2',
      eidasLevel: 'eidas2',
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas3 eidas2',
        scope,
      },
    });
  });

  it('should access to FI when acr from SP is multiple values but only one is known', () => {
    basicScenario({
      idpId: 'fip1v2',
      eidasLevel: 'eidas2',
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2 eidas666 eidas1',
        scope,
      },
    });
  });

  it('should access to FI when acr from SP is unique and not known', () => {
    basicScenario({
      idpId: 'fip1v2',
      eidasLevel: 'eidas3',
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas666',
        scope,
      },
    });
  });

  it('should access to FI when acr from SP has multiple values and one is known', () => {
    basicScenario({
      idpId: 'fip1v2',
      eidasLevel: 'eidas2',
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2 eidas666 eidas1',
        scope,
      },
    });
  });

  it('should access to FI when acr from SP has multiple values and some are known', () => {
    basicScenario({
      idpId: 'fip1v2',
      eidasLevel: 'eidas2',
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2 eidas666 eidas3',
        scope,
      },
    });
  });

  it('should access to FI when acr from SP has multiple values and none are known', () => {
    basicScenario({
      idpId: 'fip1v2',
      eidasLevel: 'eidas3',
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas28 eidas666 eidas42',
        scope,
      },
    });
  });

  it('should complete cinematic even when acr is to low and FC should force it to max value', () => {
    const FORCE_MAX_EIDAS = 'eidas3';
    basicScenario({
      idpId: 'fip1v2',
      eidasLevel: FORCE_MAX_EIDAS,
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas1',
        scope,
      },
    });

    // FC: Read confirmation message :D
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);

    // FC: validate consent
    cy.get('#consent').click();

    // return to FS
    cy.url().should('include', `${Cypress.env('SP1_ROOT_URL')}/login-callback`);

    cy.get('#info-acr').contains(FORCE_MAX_EIDAS);
  });

  // @todo see: This section should be implemented in the IDP Mock instance (eidasLevel)
  //
  // it('should trigger error Y020001 when acr from IdP is lower than asked', () => {
  //   basicErrorScenario({
  //     errorCode: 'test',
  //     idpId: 'fip1v2',
  //     eidasLevel: 'eidas1',
  //   });

  //   cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/verify`));
  //   cy.hasError('Y020001');
  // });
});
