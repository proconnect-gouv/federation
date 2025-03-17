import { Then } from '@badeball/cypress-cucumber-preprocessor';

import { getDefaultUser } from '../../common/helpers/user-helper';
import { ChainableElement } from '../../common/types';

function getContactSupportLink(): ChainableElement {
  return cy.get('a[href*="mailto:support+federation@proconnect.gouv.fr"] ');
}

function filterErrorId(message: string): string {
  return message.replace(
    /L'id de l'erreur est : .*?\./,
    "L'id de l'erreur est : <errorId>.",
  );
}

function filterIdentity(rawIdentity: string): string {
  return rawIdentity.replace(
    /(\{[^}]*"sub"\s*:\s*)"([^"]*)"/g,
    '$1"<removed>"',
  );
}

function filterEncodedIdentity(rawIdentity: string): string {
  const urlParts = rawIdentity.split('&body=');

  if (urlParts.length < 2) {
    return rawIdentity;
  }

  const baseUrl = urlParts[0];
  const encodedBody = urlParts[1];

  let decodedBody = decodeURIComponent(encodedBody);
  decodedBody = decodedBody.replace(/("sub"\s*:\s*)"(.*?)"/, '$1"<removed>"');
  const newEncodedBody = encodeURIComponent(decodedBody);

  return `${baseUrl}&body=${newEncodedBody}`;
}

Then(
  /^le lien vers le support (est|n'est pas) affiché$/,
  function (text: string) {
    const isVisible = text === 'est';
    getContactSupportLink().should(isVisible ? 'be.visible' : 'not.be.visible');
  },
);

Then(
  /^le href est celui par défaut avec le fs "([^"]+)", le fi "([^"]+)" et l'erreur "([^"]+)"$/,
  function (spName: string, idpName: string, errorCode: string) {
    getContactSupportLink()
      .invoke('attr', 'href')
      .then((hrefValue) => {
        cy.log(hrefValue);

        const filteredReturnedHref = filterErrorId(hrefValue);

        const expectedHref = `mailto:support+federation@proconnect.gouv.fr?subject=Signaler l'erreur Y500015 sur ProConnect&body=Bonjour, je vous signale que j'ai rencontré une erreur dont le code est : ${errorCode} et dont le message d'erreur est : non renseigné. L'id de l'erreur est : <errorId>. Je souhaitais me connecter à : ${spName}. Mon fournisseur d'identité est : ${idpName}.`;

        expect(filteredReturnedHref).to.equal(expectedHref);
      });
  },
);

Then(
  /^le href correspond à l'erreur Y500006 avec l'email "([^"]+)"$/,
  function (email: string) {
    getContactSupportLink()
      .invoke('attr', 'href')
      .then((hrefValue) => {
        const user = getDefaultUser();

        const filteredReturnedHref = filterErrorId(hrefValue);
        const validationConstraints = '[{"isEmail":"email must be an email"}]';
        const validationTarget = filterIdentity(
          `{"sub":"","given_name":"${user.given_name}","usual_name":"${user.usual_name}","email":"${email}","uid":"${user.uid}","siren":"${user.siren}","siret":"${user.siret}","organizational_unit":"${user.organizational_unit}","belonging_population":"${user.belonging_population}","phone_number":"${user.phone_number}"}`,
        );

        const expectedHref = `mailto:support+federation@proconnect.gouv.fr?subject=Mise à jour de mon profil pour compatibilité ProConnect&body=${encodeURIComponent(
          `Bonjour,\nVoici une erreur remontée par ProConnect suite à une tentative de connexion infructueuse.\n${validationConstraints}\nVoici l’identité telle que reçue par ProConnect :\n${validationTarget}\nProConnect a vérifié que l’erreur ne venait pas de leur côté.\nMerci de corriger mes informations d'identité afin que ProConnect reconnaisse mon identité et que je puisse me connecter.\nCordialement,`,
        )}`;

        expect(expectedHref).to.equal(
          filterEncodedIdentity(filteredReturnedHref),
        );
      });
  },
);
