// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import { addMatchImageSnapshotCommand } from "@simonsmith/cypress-image-snapshot/command";
import "cypress-axe";
import "cypress-maildev";
import "cypress-plugin-api";
import "reflect-metadata";

function resetMongo() {
  const DOCKER_DIR = `cd ${Cypress.env("FEDERATION_DIR")}/docker`;
  const SAFETY_EXEC_TIMEOUT = 10000; // 10 sec

  const command = `${DOCKER_DIR} && CI=1 ./docker-stack reset-db`;

  console.log(`
    Executing command:
    > ${command}
  `);

  return cy
    .exec(command, { timeout: SAFETY_EXEC_TIMEOUT })
    .its("exitCode")
    .should("eq", 0);
}

Cypress.Commands.add(
  "clearThenType",
  { prevSubject: "element" },
  (subject, text, options = {}) => {
    cy.wrap(subject).trigger("keydown");
    cy.wrap(subject).invoke("val", text, options);
    // It is safe to chain those commands as there are no UI changes
    cy.wrap(subject).trigger("keyup").trigger("input").trigger("change");
  },
);

function verifyEmailCommand() {
  return cy
    .maildevGetMessageBySubject("Vérification de votre adresse email")
    .then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.origin(
        `${Cypress.expose("MAILDEV_PROTOCOL")}://${Cypress.expose("MAILDEV_HOST")}`,
        () => {
          cy.contains(
            "Pour vérifier votre adresse e-mail, merci de copier-coller ou de renseigner ce code dans l’interface de connexion ProConnect.",
          );
        },
      );
      cy.go("back");
      cy.maildevDeleteMessageById(email.id);
      return cy.maildevGetOTPCode(email.html, 10);
    })
    .then((code) => {
      if (!code)
        throw new Error("Could not find verification code in received email");
      cy.get('[name="verify_email_token"]').type(code);
      cy.get('[type="submit"]').click();
    });
}
Cypress.Commands.add("verifyEmail", verifyEmailCommand);

Cypress.Commands.add("resetMongo", resetMongo);

addMatchImageSnapshotCommand({
  capture: "fullPage",
  customDiffConfig: { threshold: 0.3 },
  customDiffDir: "./cypress/snapshots/diff",
  customSnapshotsDir: "./cypress/snapshots/base",
  e2eSpecDir: "cypress/integration/visuel",
  failureThreshold: 0.1,
  failureThresholdType: "percent",
});

beforeEach(() => {
  cy.maildevDeleteAllMessages();
});
