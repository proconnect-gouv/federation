import { Then, When } from 'cypress-cucumber-preprocessor/steps';

import InfoConsentPage from '../pages/info-consent-page';

const infoConsentPage = new InfoConsentPage();

Then("je suis redirigé vers la page 'confirmation de connexion'", function () {
  infoConsentPage.checkIsVisible();
});

Then(
  'les informations demandées par le fournisseur de service correspondent au scope {string}',
  function (type) {
    const scope = this.scopes.find((scope) => scope.type === type);
    infoConsentPage.checkInformationConsent(scope);
  },
);

Then(
  'aucune information demandée par le fournisseur de service pour le scope "anonyme"',
  function () {
    infoConsentPage.checkAnonymousScope();
  },
);

When('je confirme le retour vers le fournisseur de service', function () {
  infoConsentPage.consentButton.click();
});
