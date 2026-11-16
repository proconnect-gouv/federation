import { When } from "@badeball/cypress-cucumber-preprocessor";

// Submits the OTP in the background so that the browser stays on the
// verification page: the interaction is not finished, but the session already
// holds the email verification.
When(
  "je valide le code de confirmation reçu par e-mail sans poursuivre la cinématique",
  function () {
    cy.get('#verify-email input[name="csrfToken"]')
      .invoke("val")
      .as("csrfToken");
    cy.location("origin").as("coreOrigin");

    cy.maildevGetMessageBySubject("Test - Code à usage unique").then(
      (email) => {
        cy.maildevDeleteMessageById(email.id);
        cy.maildevGetOTPCode(email.html, 8).as("otpCode");
      },
    );

    cy.then(function () {
      cy.request({
        method: "POST",
        url: `${this.coreOrigin}/api/v2/verify-email`,
        form: true,
        followRedirect: false,
        body: {
          verify_email_token: this.otpCode,
          csrfToken: this.csrfToken,
        },
      }).then((response) => {
        expect(response.status).to.eq(302);
        expect(response.redirectedToUrl).to.match(/\/interaction\/.+\/verify$/);
      });
    });
  },
);

// Posts the email form again without going through the interaction page,
// which would otherwise reset the session. The request is sent in the
// background, then the browser visits the IdP: `cy.visit()` waits for the IdP
// page to load before the next step looks for its form.
When(
  "je relance une connexion avec l'email {string} dans la même session",
  function (email: string) {
    cy.get('#verify-email input[name="csrfToken"]')
      .invoke("val")
      .then((csrfToken) => {
        cy.location("origin").then((coreOrigin) => {
          cy.request({
            method: "POST",
            url: `${coreOrigin}/api/v2/redirect-to-idp`,
            form: true,
            followRedirect: false,
            body: { email, csrfToken },
          }).then((response) => {
            expect(response.status).to.eq(302);
            cy.visit(response.redirectedToUrl);
          });
        });
      });
  },
);
