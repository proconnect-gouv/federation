import { Then } from '@badeball/cypress-cucumber-preprocessor';

import { ChainableElement } from '../../common/types';

function getContactSupportLink(): ChainableElement {
  return cy.get(
    `a[href*="mailto:${encodeURIComponent('support+federation@proconnect.gouv.fr')}"]`,
  );
}

Then(
  /^le lien vers le support (est|n'est pas) affiché$/,
  function (text: string) {
    const isVisible = text === 'est';
    getContactSupportLink().should(isVisible ? 'be.visible' : 'not.be.visible');
  },
);

Then(
  /^le lien est celui par défaut avec le fs "([^"]+)", le fi "([^"]+)" et l'erreur "([^"]+)"$/,
  function (spName: string, idpName: string, errorCode: string) {
    getContactSupportLink()
      .invoke('attr', 'href')
      .then((hrefValue) => {
        const matches = hrefValue.match(/subject=([^&]+)&body=([^&]+)/);
        expect(matches).to.have.length(3);
        const subject = decodeURIComponent(matches[1]);
        const body = decodeURIComponent(matches[2]);

        expect(subject).to.contains(
          `Signaler l’erreur ${errorCode} sur ProConnect`,
        );
        expect(body).to.contains(`Je souhaitais me connecter à « ${spName} ».`);
        expect(body).to.contains(
          `Mon fournisseur d’identité est « ${idpName} ».`,
        );
      });
  },
);

Then(
  /^le lien correspond à l'erreur Y500006 avec l'email "([^"]+)"$/,
  function (email: string) {
    getContactSupportLink()
      .invoke('attr', 'href')
      .then((hrefValue) => {
        const matches = hrefValue.match(/subject=([^&]+)&body=([^&]+)/);
        expect(matches).to.have.length(3);
        const httpEncodedBody = matches.pop();

        const body = decodeURIComponent(httpEncodedBody);
        const validationConstraintsMatch = body.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        expect(validationConstraintsMatch).to.have.length(1);
        const validationConstraints = JSON.parse(validationConstraintsMatch[0]);
        const expectedValidationConstraints = [
          { isEmail: 'email must be an email' },
        ];
        expect(validationConstraints).to.deep.equal(
          expectedValidationConstraints,
        );

        const validationTargetMatch = body.match(/\{\s*"sub"[\s\S]*?\}/);
        expect(validationTargetMatch).to.have.length(1);
        const validationTarget = JSON.parse(validationTargetMatch[0]);
        delete validationTarget.exp;
        delete validationTarget.iat;
        delete validationTarget.iss;
        delete validationTarget.aud;

        expect(validationTarget).to.deep.equal({
          belonging_population: 'agent',
          'chorusdt:matricule': 'USER_AGC',
          'chorusdt:societe': 'CHT',
          email: email,
          email_verified: false,
          given_name: 'John',
          organizational_unit: 'comptabilite',
          phone_number: '+49 000 000000',
          phone_number_verified: false,
          siren: '130025265',
          siret: '13002526500013',
          sub: '1',
          uid: '1',
          usual_name: 'Doe',
        });
      });
  },
);
