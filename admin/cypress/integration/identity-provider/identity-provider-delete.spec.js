import { USER_OPERATOR, USER_PASS } from "../../support/constants";
import { createIdentityProvider } from "./identity-provider.utils";

const basicConfiguration = {
  totp: true,
};

const BASE_URL = Cypress.config("baseUrl");

describe("Delete identity provider normal", () => {
  const fi = {
    name: "FIaSupprimer",
    title: "Fi à supprimer",
    issuer: "https://issuer.fr",
    statusUrl: "https://issuer.fr/state",
    discovery: "true",
    discoveryUrl: "https://issuer.fr/discoveryUrl",
    jwksUrl: "https://issuer.fr/discovery",
    clientId: "09a1a257648c1742c74d6a3d84b31943",
    client_secret: "1234567890AZERTYUIOP",
    siret: "34047343800034",
  };

  before(() => {
    cy.resetEnv("mongo");
    cy.login(USER_OPERATOR, USER_PASS);
    cy.visit(`/identity-provider`);
    createIdentityProvider(fi, basicConfiguration);
    cy.visit(`/identity-provider`);
    cy.contains(`${fi.name}`).should("exist");
  });

  beforeEach(() => {
    cy.clearBusinessLog();
    cy.login(USER_OPERATOR, USER_PASS);
    cy.visit(`/identity-provider`);
    cy.contains(`${fi.name}`).should("exist");
  });

  it("Does not delete if action is cancel", () => {
    cy.get(
      `form[data-element-title="${fi.title}"] button[type="submit"]`,
    ).click();
    cy.contains("Annuler").click();
    cy.visit(`/identity-provider`);
    cy.contains(`${fi.name}`).should("exist");
  });

  it("Does not delete if totp is not correct or empty", () => {
    cy.get(
      `form[data-element-title="${fi.title}"] button[type="submit"]`,
    ).click();
    cy.contains("Confirmer").click();
    cy.contains(`Le TOTP n'a pas été saisi`).should("exist");
    cy.get("#totpModal").type("000000");
    cy.contains("Confirmer").click();
    cy.contains(`Le TOTP saisi n'est pas valide`).should("exist");
    cy.visit(`/identity-provider?page=1&limit=9999`);
    cy.contains(`${fi.name}`).should("exist");
  });

  it("Should delete one identity provider", () => {
    cy.get(
      `form[data-element-title="${fi.title}"] button[type="submit"]`,
    ).click();
    cy.get("#totpModal").then(() => cy.totp(basicConfiguration));
    cy.contains("Confirmer").click();
    cy.contains(
      `Le fournisseur d'identité ${fi.name} a été supprimé avec succès !`,
    ).should("exist");
    cy.closeBanner(".alert-success");
    cy.get("#list-table").should("not.contain", `${fi.name}`);
    cy.hasBusinessLog({
      entity: "identity-provider",
      action: "delete",
      user: USER_OPERATOR,
      name: fi.name,
    });
  });
});
describe("Delete identity provider non latin", () => {
  const fiNonLatinChar = {
    name: `denver le Dernier Dinosaure Test . - _ À à Á á Â â Ã ã Ä ä Å å Æ æ Ç ç Ð ð È è É é Ê ê Ë ë Ì ì Í í Î î Ï ï Ñ ñ Ò ò Ó ó Ô ô Õ õ Ö ö œ Œ Ø ø ß Ù ù Ú ú Û û Ü ü Ý ý Þ þ Ÿ ÿ : * '' / + - ()è - OK`,
    title: "Fi caractère non latin",
    issuer: "https://issuer.fr",
    statusUrl: "https://issuer.fr/state",
    discovery: "true",
    discoveryUrl: "https://issuer.fr/discoveryUrl",
    jwksUrl: "https://issuer.fr/discovery",
    clientId: "09a1a257648c1742c74d6a3d84b31943",
    client_secret: "1234567890AZERTYUIOP",
    siret: "34047343800034",
  };

  before(() => {
    cy.resetEnv("mongo");
    cy.login(USER_OPERATOR, USER_PASS);
    cy.visit(`/identity-provider`);
    createIdentityProvider(fiNonLatinChar, basicConfiguration);
    cy.visit(`/identity-provider`);
    cy.contains(`${fiNonLatinChar.name}`).should("exist");
    cy.login(USER_OPERATOR, USER_PASS);
    cy.visit(`/identity-provider`);
    cy.contains(`${fiNonLatinChar.name}`).should("exist");
  });

  it("Should delete identity provider with non-latin characters", () => {
    cy.get(
      `form[data-element-title="${fiNonLatinChar.title}"] button[type="submit"]`,
    ).click();
    cy.get("#totpModal").then(() => cy.totp(basicConfiguration));
    cy.contains("Confirmer").click();
    cy.url().should("eq", `${BASE_URL}/identity-provider`);
    cy.contains(
      `Le fournisseur d'identité ${fiNonLatinChar.name} a été supprimé avec succès !`,
    ).should("exist");
    cy.closeBanner(".alert-success");
    cy.get("#list-table").should("not.contain", `${fiNonLatinChar.name}`);
  });
});
