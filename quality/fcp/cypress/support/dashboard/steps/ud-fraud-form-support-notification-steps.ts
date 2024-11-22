import { Then } from '@badeball/cypress-cucumber-preprocessor';

import UdFraudFormSupportNotificationPage from '../pages/ud-fraud-form-support-notification';

const udFraudFormSupportNotificationPage =
  new UdFraudFormSupportNotificationPage();

Then('le mail "demande de support" est envoyé', function () {
  const { contactEmail } = this.fraudFormValues;
  // Wait for the email to reach maildev
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
  udFraudFormSupportNotificationPage
    .visitLastSupportRequest(contactEmail)
    .then((message) => {
      this.mail = message;
    });
});

Then(
  'le sujet est {string} dans le mail "demande de support"',
  function (text: string) {
    const { subject } = this.mail;
    expect(subject).to.equal(text);
  },
);

Then(`l'expéditeur est correct dans le mail "demande de support"`, function () {
  const { from } = this.mail;
  expect(from.length).to.equal(1);
  const [firstSender] = from;
  const { address } = firstSender;
  const { contactEmail } = this.fraudFormValues;
  expect(contactEmail).to.exist;
  expect(contactEmail).to.equal(address);
});

Then(
  'le destinataire est le "Support Sécurité" dans le mail "demande de support"',
  function () {
    const { to } = this.mail;
    expect(to.length).to.equal(1);
    const [firstRecipient] = to;
    const { name } = firstRecipient;
    expect(name).to.equal('Support Sécurité');
  },
);

Then(
  '{string} est {string} dans le mail "demande de support"',
  function (contentKey: string, value: string) {
    udFraudFormSupportNotificationPage.checkContentKeyHasValue(
      contentKey,
      value,
    );
  },
);

Then(
  `"Email du compte FI" contient l'email du compte FI dans le mail "demande de support"`,
  function () {
    const { email } = this.user.claims as {
      email: string;
    };
    udFraudFormSupportNotificationPage.checkContentKeyHasValue(
      'idpEmail',
      email,
    );
  },
);

Then(
  `les informations d'identité sont présentes dans le mail "demande de support"`,
  function () {
    const {
      birthcountry,
      birthdate,
      birthplace,
      family_name: familyName,
      given_name: givenName,
    } = this.user.claims;

    Object.entries({
      birthcountry,
      birthdate,
      birthplace,
      familyName,
      givenName,
    }).forEach(([key, value]) => {
      udFraudFormSupportNotificationPage.checkContentKeyHasValue(
        key,
        value as string,
      );
    });
  },
);

Then(
  `les champs du formulaire sont présents dans le mail "demande de support"`,
  function () {
    Object.entries(this.fraudFormValues).forEach(([key, value]) => {
      udFraudFormSupportNotificationPage.checkContentKeyHasValue(key, value);
    });
  },
);

Then(
  `{string} n'est pas présent dans le mail "demande de support"`,
  function (contentKey: string) {
    udFraudFormSupportNotificationPage.checkContentKeyNotExist(contentKey);
  },
);

Then(
  `le nombre de traces dans le mail "demande de support" est {int}`,
  function (tracksCount: number) {
    udFraudFormSupportNotificationPage.checkContentKeyHasValue(
      'total',
      tracksCount.toString(),
    );
  },
);

Then(
  `le message d'erreur est {string} dans le mail "demande de support"`,
  function (error: string) {
    udFraudFormSupportNotificationPage.checkContentKeyHasValue('error', error);
  },
);

Then(
  `{string} est {string} pour la trace numéro {int} dans le mail "demande de support"`,
  function (contentKey: string, value: string, trackIndex: number) {
    const index = trackIndex - 1;
    cy.get(`[data-testid="track-${index}"]`).within(() => {
      cy.get(`[data-testid="${contentKey}"]`).should('have.text', value);
    });
  },
);

Then(
  `{string} est présent pour la trace numéro {int} dans le mail "demande de support"`,
  function (contentKey: string, trackIndex: number) {
    const index = trackIndex - 1;
    cy.get(`[data-testid="track-${index}"]`).within(() => {
      cy.get(`[data-testid="${contentKey}"]`).should('be.visible');
    });
  },
);
