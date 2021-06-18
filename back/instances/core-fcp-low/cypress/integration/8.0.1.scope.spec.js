import {
  authenticateWithIdp,
  checkInStringifiedJson,
  validateConsent,
} from './mire.utils';

describe('8.0.1 Scope', () => {
  const acrValue = 'eidas1';

  describe('end to end cinematic', () => {
    it('should send back all corresponding claims when aliases are not checked', () => {
      cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

      // Disable aliases
      cy.get('#scope_profile').click();
      cy.get('#scope_birth').click();
      cy.get('#scope_identite_pivot').click();

      // Eidas
      cy.get('#acrSelector').select(acrValue);

      // Go to FC
      cy.get('#get-authorize').click();

      // Choose IdP
      cy.get(`#idp-fip1-low`).click();

      // Login
      authenticateWithIdp({
        login: 'avec_nom_dusage',
      });

      // Consent
      validateConsent();

      checkInStringifiedJson('gender', 'male');
      checkInStringifiedJson('birthdate', '1969-03-17');
      checkInStringifiedJson('birthcountry', '99100');
      checkInStringifiedJson('birthplace', '95277');
      checkInStringifiedJson('given_name', 'Pierre');
      checkInStringifiedJson('family_name', 'MERCIER');
      checkInStringifiedJson('email', 'ymmyffarapp-1777@yopmail.com');
      checkInStringifiedJson('preferred_username', 'DUBOIS');
      checkInStringifiedJson('address', {
        country: 'France',
        locality: 'Paris',
        // openid defined property names
        // eslint-disable-next-line @typescript-eslint/naming-convention
        postal_code: '75107',
        // openid defined property names
        // eslint-disable-next-line @typescript-eslint/naming-convention
        street_address: '20 avenue de Ségur',
      });
      checkInStringifiedJson('phone_number', '623456789');

      checkInStringifiedJson(
        'sub',
        'faa0788fe8845bdcd6c993dcd4a42ce0d0f6cfe69f180c36ad145b0dd31e1cedv1',
      );
    });

    it('should send back birthplace and birthcountry when you choose birth alias', () => {
      cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

      // We select only birth
      cy.get('#scope_profile').click();
      cy.get('#scope_gender').click();
      cy.get('#scope_birthdate').click();
      cy.get('#scope_birthcountry').click();
      cy.get('#scope_birthplace').click();
      cy.get('#scope_given_name').click();
      cy.get('#scope_family_name').click();
      cy.get('#scope_email').click();
      cy.get('#scope_preferred_username').click();
      cy.get('#scope_address').click();
      cy.get('#scope_phone').click();
      cy.get('#scope_identite_pivot').click();

      // Eidas
      cy.get('#acrSelector').select(acrValue);

      // Go to FC
      cy.get('#get-authorize').click();

      // Choose IdP
      cy.get(`#idp-fip1-low`).click();

      // Login
      authenticateWithIdp({
        login: 'avec_nom_dusage',
      });

      // Consent
      validateConsent();

      checkInStringifiedJson('gender', undefined);
      checkInStringifiedJson('birthdate', undefined);
      checkInStringifiedJson('birthcountry', '99100');
      checkInStringifiedJson('birthplace', '95277');
      checkInStringifiedJson('given_name', undefined);
      checkInStringifiedJson('family_name', undefined);
      checkInStringifiedJson('email', undefined);
      checkInStringifiedJson('preferred_username', undefined);
      checkInStringifiedJson('address', undefined);
      checkInStringifiedJson('phone_number', undefined);
      checkInStringifiedJson(
        'sub',
        'faa0788fe8845bdcd6c993dcd4a42ce0d0f6cfe69f180c36ad145b0dd31e1cedv1',
      );
    });

    it('should send back right claims when you choose identite_pivot alias', () => {
      cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

      // We select only identite_pivot
      cy.get('#scope_profile').click();
      cy.get('#scope_gender').click();
      cy.get('#scope_birthdate').click();
      cy.get('#scope_birthcountry').click();
      cy.get('#scope_birthplace').click();
      cy.get('#scope_given_name').click();
      cy.get('#scope_family_name').click();
      cy.get('#scope_email').click();
      cy.get('#scope_preferred_username').click();
      cy.get('#scope_address').click();
      cy.get('#scope_phone').click();
      cy.get('#scope_birth').click();

      // Eidas
      cy.get('#acrSelector').select(acrValue);

      // Go to FC
      cy.get('#get-authorize').click();

      // Choose IdP
      cy.get(`#idp-fip1-low`).click();

      // Login
      authenticateWithIdp({
        login: 'avec_nom_dusage',
      });

      // Consent
      validateConsent();

      checkInStringifiedJson('gender', 'male');
      checkInStringifiedJson('birthdate', '1969-03-17');
      checkInStringifiedJson('birthcountry', '99100');
      checkInStringifiedJson('birthplace', '95277');
      checkInStringifiedJson('given_name', 'Pierre');
      checkInStringifiedJson('family_name', 'MERCIER');
      checkInStringifiedJson(
        'sub',
        'faa0788fe8845bdcd6c993dcd4a42ce0d0f6cfe69f180c36ad145b0dd31e1cedv1',
      );
      checkInStringifiedJson('preferred_username', undefined);
      checkInStringifiedJson('email', undefined);
      checkInStringifiedJson('address', undefined);
      checkInStringifiedJson('phone_number', undefined);
    });

    it('should send back right claims when you choose profile alias', () => {
      cy.visit(`${Cypress.env('SP1_ROOT_URL')}`);

      // We select only profile
      cy.get('#scope_gender').click();
      cy.get('#scope_birthdate').click();
      cy.get('#scope_birthcountry').click();
      cy.get('#scope_birthplace').click();
      cy.get('#scope_given_name').click();
      cy.get('#scope_family_name').click();
      cy.get('#scope_email').click();
      cy.get('#scope_preferred_username').click();
      cy.get('#scope_address').click();
      cy.get('#scope_phone').click();
      cy.get('#scope_birth').click();
      cy.get('#scope_identite_pivot').click();

      // Eidas
      cy.get('#acrSelector').select(acrValue);

      // Go to FC
      cy.get('#get-authorize').click();

      // Choose IdP
      cy.get(`#idp-fip1-low`).click();

      // Login
      authenticateWithIdp({
        login: 'avec_nom_dusage',
      });

      // Consent
      validateConsent();

      checkInStringifiedJson('gender', 'male');
      checkInStringifiedJson('birthdate', '1969-03-17');
      checkInStringifiedJson('given_name', 'Pierre');
      checkInStringifiedJson('family_name', 'MERCIER');
      checkInStringifiedJson('preferred_username', 'DUBOIS');
      checkInStringifiedJson(
        'sub',
        'faa0788fe8845bdcd6c993dcd4a42ce0d0f6cfe69f180c36ad145b0dd31e1cedv1',
      );
      checkInStringifiedJson('birthplace', undefined);
      checkInStringifiedJson('birthcountry', undefined);
      checkInStringifiedJson('email', undefined);
      checkInStringifiedJson('address', undefined);
      checkInStringifiedJson('phone_number', undefined);
    });
  });
});
