import { Given, When } from "@badeball/cypress-cucumber-preprocessor";
import { resetSimulatedBrowsers, useSimulatedBrowser } from "../helpers";

Given("les navigateurs sont réinitialisés", function () {
  resetSimulatedBrowsers();
});

When("j'utilise le navigateur {string}", function (browser: string) {
  useSimulatedBrowser(browser);
});
