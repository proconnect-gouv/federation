import { basicScenario, checkInformationsServiceProvider } from './mire.utils';

/**
 * @todo #242 - remove and let basic scopes
 */
const scope =
  'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address phone';

const claims = JSON.stringify({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  id_token: {
    amr: { essential: true },
  },
});

describe('5.0.5 - Claims', () => {
  it('should passthrough amr value from FC to Eidas, and send back this value to SP', () => {
    basicScenario({
      idpId: 'fip1v2',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
      overrideParams: {
        // Oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: 'eidas2',
        scope,
        claims,
      },
    });
    cy.url().should('match', /\/api\/v2\/interaction\/[0-9a-z_-]+\/consent/i);
    cy.get('#consent').click();
    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
      amr: 'fc',
    });
  });
});
