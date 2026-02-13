import { Given } from '@badeball/cypress-cucumber-preprocessor';
import { TOTP } from 'otpauth';

const defaultTotpSecret = 'din5ncvbluqpx7xfzqcybmibmtjocnsf';

Given('je rentre un mot de passe valide sur ProConnect Identité', function () {
  cy.get(".fr-password input[name='password']").clearThenType('password123');
  cy.get("button[type='submit']").first().click();
});

Given('je rentre un totp valide sur ProConnect Identité', function () {
  const totp = new TOTP({
    secret: defaultTotpSecret,
  });
  cy.get('[name=totpToken]').type(totp.generate());
  cy.get('[action="/users/2fa-sign-in-with-totp"] [type="submit"]').click();
});

Given(
  'je sélectionne une organisation publique sur ProConnect Identité',
  function () {
    cy.get('#submit-join-organization-1').click();
  },
);

Given(
  'je sélectionne une organisation privée sur ProConnect Identité',
  function () {
    cy.get('#submit-join-organization-49').click();
  },
);

Given(
  "je vois une page d'erreur ProConnect Identité et je clique sur le bouton continuer",
  function () {
    cy.contains('none of the requested ACRs could be obtained');
    cy.contains('Continuer').click();
  },
);
