import { USER_PASS, USER_SECURITY } from "../../support/constants";

const basicConfiguration = {
  totp: true,
  fast: true,
};

const DEACTIVATED_USER_SUB = "2c98c3a8-5094-45e9-9c85-7e453323c328";

describe("Federation user list", () => {
  before(() => {
    cy.resetEnv("mongo");
    cy.login(USER_SECURITY, USER_PASS);
  });

  describe("List Federation users as Security", () => {
    beforeEach(() => {
      cy.login(USER_SECURITY, USER_PASS);
    });

    it("I can see the list of all federation users", () => {
      cy.visit(`/federation-user`);

      cy.contains(`Gestion des utilisateurs de la Fédération`).should(
        "be.visible",
      );

      cy.get(
        `tr#${DEACTIVATED_USER_SUB} > td.cell-activation-status > i`,
      ).should("have.class", "fa-toggle-off");
    });

    it("I can search a federation user by sub", () => {
      cy.visit(`/federation-user`);
      cy.get("#searchInput").type(DEACTIVATED_USER_SUB);
      cy.contains("Rechercher").click();

      cy.get("table tbody tr").should("have.length", 1);
      cy.get("table").should("contain.text", DEACTIVATED_USER_SUB);
    });

    it("I can search a federation user by email", () => {
      cy.visit(`/federation-user`);
      cy.get("#searchInput").type("user-multiple-idp@fia1.fr");
      cy.contains("Rechercher").click();

      cy.get("table tbody tr").should("have.length", 1);
      cy.get("table").should("contain.text", "user-multiple-idp@fia1.fr");
    });

    it("I cannot search a federation user with a string that is neither a sub nor an email", () => {
      cy.visit(`/federation-user`);

      cy.get("#searchInput").clear().type("not-a-sub-or-email");
      cy.contains("Rechercher").click();

      cy.get("table tbody tr").should("have.length", 2);
    });

    it("I cannot activate a federation user if totp not filled", () => {
      cy.visit(`/federation-user`);

      cy.get(`tr#${DEACTIVATED_USER_SUB} i.fa-unlock`).click();

      cy.contains("Confirmer").click();
      cy.contains(`Le TOTP n'a pas été saisi`).should("be.visible");
      cy.get("#totpModal").type("000000");
      cy.contains("Confirmer").click();

      cy.contains(`Le TOTP saisi n'est pas valide`).should("be.visible");
      cy.visit(`/federation-user`);
      cy.get(
        `tr#${DEACTIVATED_USER_SUB} > td.cell-activation-status > i`,
      ).should("have.class", "fa-toggle-off");
    });

    it("I can activate a federation user if totp filled", () => {
      cy.visit(`/federation-user`);

      cy.get(`tr#${DEACTIVATED_USER_SUB} i.fa-unlock`).click();
      cy.contains("Voulez-vous activer l'utilisateur").should("be.visible");
      cy.get("#totpModal").then(() => cy.totp(basicConfiguration));
      cy.contains("Confirmer").click();

      cy.visit(`/federation-user`);
      cy.get(
        `tr#${DEACTIVATED_USER_SUB} > td.cell-activation-status > i`,
      ).should("have.class", "fa-toggle-on");
    });

    it("I can deactivate a federation user if totp filled", () => {
      cy.visit(`/federation-user`);

      cy.get(`tr#${DEACTIVATED_USER_SUB} i.fa-lock`).click();
      cy.contains("Voulez-vous désactiver l'utilisateur").should("be.visible");
      cy.get("#totpModal").then(() => cy.totp(basicConfiguration));
      cy.contains("Confirmer").click();

      cy.visit(`/federation-user`);
      cy.get(
        `tr#${DEACTIVATED_USER_SUB} > td.cell-activation-status > i`,
      ).should("have.class", "fa-toggle-off");
    });
  });
});
