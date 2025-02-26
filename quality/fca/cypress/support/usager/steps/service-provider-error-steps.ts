import { Then } from '@badeball/cypress-cucumber-preprocessor';

const ERROR_URL_REGEXP =
  /^https:\/\/.*\/oidc-callback([?#])error=([^&]+)&error_description=([^&]+)&state=.+$/;
const URL_TYPE_GROUP = 1;

const checkErrorCallbackUrl = (url: string, containsQuery = true): void => {
  const match = url.match(ERROR_URL_REGEXP);
  expect(match.length).to.equal(4);
  const delimitor = containsQuery ? '?' : '#';
  expect(match[URL_TYPE_GROUP]).to.equal(delimitor);
};

Then(
  /^l'entête de la réponse a une propriété "location" contenant l'url de callback du FS avec l'erreur( \(fragment\))?$/,
  function (text: string) {
    const containsQuery = !text;
    cy.get('@apiResponse')
      .its('headers')
      .its('location')
      .then((url) => {
        checkErrorCallbackUrl(url, containsQuery);
      });
  },
);
