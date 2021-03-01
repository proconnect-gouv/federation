import {
  basicErrorScenario,
  basicScenario,
  getServiceProvider,
} from './mire.utils';

const scope =
  'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address phone';

describe('Acr', () => {
  // -- replace by either `fip1v2` or `fia1v2`
  const idpId = `${Cypress.env('IDP_NAME')}1v2`;

  it('should access to FI when acr from SP is unique and known', () => {
    basicScenario({
      idpId,
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
      idpId,
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
      idpId,
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
      idpId,
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
      idpId,
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
      idpId,
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
      idpId,
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
      idpId,
      eidasLevel: 'eidas3',
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas28 eidas666 eidas42',
        scope,
      },
    });
  });

  /**
   * @todo #311 Place a dropdown menu in the IDp Mock to allow the ACR to be searched.
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/311
   */
  it.skip('should complete cinematic even when acr is to low and FC should force it to max value', () => {
    const { SP_ROOT_URL } = getServiceProvider(`${Cypress.env('SP_NAME')}1v2`);
    const FORCE_MAX_EIDAS = 'eidas3';
    basicScenario({
      idpId,
      eidasLevel: FORCE_MAX_EIDAS,
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas1',
        scope,
      },
    });

    // return to FS
    cy.url().should('include', `${SP_ROOT_URL}/login-callback`);

    cy.get('#info-acr').contains(FORCE_MAX_EIDAS);
  });

  /**
   * @todo #311 Place a dropdown menu in the IDp Mock to allow the ACR to be searched.
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/311
   */
  it.skip('should trigger error Y020001 when acr from IdP is lower than asked', () => {
    basicErrorScenario({
      errorCode: 'test',
      idpId,
      eidasLevel: 'eidas1',
    });

    cy.url().should('match', new RegExp(`\/interaction\/[^/]+\/verify`));
    cy.hasError('Y020001');
  });
});
