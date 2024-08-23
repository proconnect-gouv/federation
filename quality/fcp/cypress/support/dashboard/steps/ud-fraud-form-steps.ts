import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { navigateTo } from '../../common/helpers';
import UdFraudFormPage from '../pages/ud-fraud-form-page';

let udFraudFormPage: UdFraudFormPage;

Given(
  /^je navigue directement vers le formulaire usurpation(?: avec fraudSurveyOrigin égal à "([^"]+)")?$/,
  function (fraudSurveyOrigin?: string) {
    const { allAppsUrl } = this.env;
    navigateTo({
      appId: 'ud-fraud-form',
      baseUrl: allAppsUrl,
    });
    if (fraudSurveyOrigin) {
      cy.url().then((currentUrl) => {
        const url = new URL(currentUrl);
        url.searchParams.set('fraudSurveyOrigin', fraudSurveyOrigin);

        cy.visit(url.href);
      });
    }
  },
);

Given(
  /^je suis redirigé vers le formulaire usurpation(?: avec fraudSurveyOrigin égal à "([^"]+)")?$/,
  function (fraudSurveyOrigin?: string) {
    const { udRootUrl } = this.env;
    udFraudFormPage = new UdFraudFormPage(udRootUrl);
    udFraudFormPage.checkIsVisible();
    if (fraudSurveyOrigin) {
      udFraudFormPage.checkHasFraudSurveyOriginQueryParam(fraudSurveyOrigin);
    }
  },
);
