import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";
import {
  getServiceProviderByDescription,
  useSimulatedBrowser,
} from "../../common/helpers";

const REVIEW_PAGE_TITLE = "Vérifiez une session sur un nouvel appareil";
const RIE_IDP_WARNING_PAGE_TITLE = "Authentification hors RIE";
const XDA_PAGE_TITLE = "Vérifier cet appareil depuis l'ordinateur RIE";

const loginOnRieIdp = (email: string): void => {
  const serviceProvider = getServiceProviderByDescription("par défaut");
  cy.visit(serviceProvider.url);
  cy.get("button#custom-connection").click({ force: true });
  cy.get("#email-input").clearThenType(email);
  cy.get('[data-testid="interaction-connection-button"]').click();
  cy.contains("h1", RIE_IDP_WARNING_PAGE_TITLE).should("be.visible");
  cy.contains("button", "Continuer").click();
  cy.get("button[type='submit']").click();
  cy.contains("Information utilisateur");
};

Given(
  "j'ai une session active sur le FI RIE avec l'email {string} sur le navigateur RIE",
  function (email: string) {
    useSimulatedBrowser("RIE");
    loginOnRieIdp(email);
  },
);

When("je clique sur le bouton {string}", function (buttonText: string) {
  cy.contains("button", buttonText).click();
});

Then("le bouton {string} n'est pas affiché", function (buttonText: string) {
  cy.contains("button", buttonText).should("not.exist");
});

Then(
  "je suis redirigé vers la page du parcours d'authentification cross-device",
  function () {
    cy.url().should("include", "/cross-device-authentication-flow/");
    cy.contains("h1", XDA_PAGE_TITLE).should("be.visible");
  },
);

Given(
  "je mémorise l'URL de la page du parcours d'authentification cross-device",
  function () {
    cy.url().as("xdaFlowPageUrl");
  },
);

When(
  "le polling de la page du parcours renvoie le statut {string}",
  function (status: string) {
    cy.intercept("GET", "**/cross-device-authentication-status/*", { status });
  },
);

Then(
  "je suis sur l'URL mémorisée de la page du parcours d'authentification cross-device",
  function () {
    cy.get<string>("@xdaFlowPageUrl").then((url) => {
      cy.url().should("eq", url);
    });
  },
);

When(
  "je retourne sur l'URL mémorisée de la page du parcours d'authentification cross-device",
  function () {
    cy.get<string>("@xdaFlowPageUrl").then((url) => cy.visit(url));
  },
);

Then(
  "je vois que la demande d'authentification cross-device a déjà été utilisée",
  function () {
    cy.contains("h1", "Demande de connexion déjà utilisée").should(
      "be.visible",
    );
  },
);

Then(
  "je vois que cette session ne peut pas vérifier de demande d'authentification cross-device",
  function () {
    cy.contains("Session ProConnect introuvable").should("be.visible");
  },
);

Then("je vois que l'authentification cross-device est approuvée", function () {
  cy.contains("Votre session est active").should("be.visible");
});

Then(
  "la demande d'authentification cross-device vient de {string}",
  function (location: string) {
    // the location is looked up in the background
    cy.get("main [data-request-id] [data-request-location]").should(
      "have.text",
      location,
    );
  },
);

Then("je vois une seule demande d'authentification cross-device", function () {
  cy.contains("h1", REVIEW_PAGE_TITLE).should("be.visible");
  cy.get("main [data-request-id]").should("have.length", 1);
  cy.get("main [data-request-id] time[data-local-date]")
    .invoke("text")
    .should("match", /^\d{2}\/\d{2}\/\d{4} à \d{2}:\d{2}$/);
});

Then(
  "je ne peux pas encore approuver la demande d'authentification cross-device",
  function () {
    cy.contains("En attente de votre nouvel appareil").should("be.visible");
    cy.contains("button", "Oui").should("not.be.visible");
    cy.contains("button", "Non").should("not.be.visible");
  },
);

Then(
  "je peux approuver la demande d'authentification cross-device",
  function () {
    cy.contains("En attente de votre nouvel appareil").should("not.be.visible");
    cy.contains("button", "Oui").should("be.visible");
    cy.contains("button", "Non").should("be.visible");
  },
);

When("j'affiche les emojis de la XDA", function () {
  cy.intercept("POST", "**/cross-device-authentication-emojis-displayed/*").as(
    "emojisDisplayed",
  );
  cy.contains("button", "Afficher les emojis").click();
  cy.wait("@emojisDisplayed").its("response.statusCode").should("eq", 204);
});

Then(
  "je vois les emojis de la demande d'authentification cross-device",
  function () {
    cy.contains("h1", "Vérifiez votre session").should("be.visible");
    cy.get(".xda-emojis li").should("have.length", 5);
  },
);

Then("je vois uniquement les instructions de la XDA", function () {
  cy.contains("h1", XDA_PAGE_TITLE).should("be.visible");
  cy.contains("button", "Afficher les emojis").should("be.visible");
  cy.contains("h1", "Vérifier la série d'emojis").should("not.be.visible");
  cy.contains("En attente de connexion de l'ordinateur RIE").should(
    "not.be.visible",
  );
  cy.get(".xda-emojis").should("not.be.visible");
});

Then(
  "je vois que la vérification de la XDA attend l'ordinateur RIE",
  function () {
    cy.contains("h1", "Vérifier la série d'emojis").should("be.visible");
    cy.contains("En attente de connexion de l'ordinateur RIE").should(
      "be.visible",
    );
    cy.contains("h1", XDA_PAGE_TITLE).should("not.be.visible");
    cy.get(".xda-emojis").should("not.be.visible");
  },
);

Then("je vois les emojis de la XDA", function () {
  cy.contains("h1", "Vérifier la série d'emojis").should("be.visible");
  cy.contains("En attente de connexion de l'ordinateur RIE").should(
    "not.be.visible",
  );
  cy.get(".xda-emojis").should("be.visible");
  cy.get(".xda-emojis li").should("have.length", 5);
});

Then(
  "je vois que la demande d'authentification cross-device est approuvée sur l'ordinateur RIE",
  function () {
    cy.location("pathname").should(
      "match",
      /^\/api\/v2\/cross-device-authentication-requests\/[0-9a-f]{24}$/,
    );
    cy.contains("h1", "Session vérifiée").should("be.visible");
    cy.contains(
      "Vous pouvez à présent utiliser ProConnect sur votre autre appareil et fermer cette fenêtre.",
    ).should("be.visible");
  },
);

Then("je ne vois aucune demande d'authentification cross-device", function () {
  cy.contains("Aucune demande de connexion en cours.").should("be.visible");
});
