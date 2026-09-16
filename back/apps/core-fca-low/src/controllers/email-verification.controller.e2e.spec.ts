import { getModelToken } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import request from "supertest";

import { MailerService } from "@fc/mailer";
import { SessionService } from "@fc/session";

import { getMailerServiceMock } from "@mocks/mailer";
import {
  AfterGetOidcCallbackSessionDocument,
  getSessionServiceMock,
} from "@mocks/session";

import { TestingBench } from "../test-bench";

const CSRF_TOKEN = "test-csrf-token";
const COOLDOWN_MS = 10 * 60 * 1000;
const { email } = AfterGetOidcCallbackSessionDocument.spIdentity;
const { interactionId } = AfterGetOidcCallbackSessionDocument;

// CsrfTokenGuard needs a real ("Csrf") answer, not just ("User").
function sessionGet(moduleName?: string, key?: string) {
  if (moduleName === "Csrf") {
    return { csrfToken: CSRF_TOKEN };
  }
  if (moduleName === "User" && key === "spIdentity.email") {
    return email;
  }
  return AfterGetOidcCallbackSessionDocument;
}

describe("EmailVerificationController", () => {
  describe("GET /verify-email", () => {
    it("should send a verification email and render the page when none was sent yet", async () => {
      const mailerMock = getMailerServiceMock();
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({ ...getSessionServiceMock(), get: sessionGet })
          .overrideProvider(MailerService)
          .useValue(mailerMock),
      );
      const { app } = bench;

      await request(app.getHttpServer())
        .get("/verify-email")
        .expect(200)
        .expect("Content-Type", "text/html; charset=utf-8")
        .expect(({ text }) => {
          expect(text).toContain(email);
          expect(text).toContain(`value="${CSRF_TOKEN}"`);
        });

      expect(mailerMock.sentMails).toEqual([
        expect.objectContaining({
          to: email,
          subject: "Code à usage unique",
        }),
      ]);

      const model = app.get<Model<any>>(
        getModelToken("EmailVerificationToken"),
      );
      const doc = await model.findOne({ email });
      expect(doc.token).toMatch(/^\d{8}$/);
    });

    it("should not resend a verification email while the previous one is in cooldown", async () => {
      const mailerMock = getMailerServiceMock();
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({ ...getSessionServiceMock(), get: sessionGet })
          .overrideProvider(MailerService)
          .useValue(mailerMock),
      );
      const { app } = bench;

      const model = app.get<Model<any>>(
        getModelToken("EmailVerificationToken"),
      );
      const sentAt = new Date();
      await model.create({ email, token: "12345678", sentAt });
      const expectedCountdownEndDate = new Date(
        sentAt.getTime() + COOLDOWN_MS,
      ).toISOString();

      await request(app.getHttpServer())
        .get("/verify-email")
        .expect(200)
        .expect(({ text }) => {
          // email only renders inside the hasSentVerificationEmail block
          expect(text).toContain("Confirmer votre adresse email");
          expect(text).not.toContain("Code de vérification envoyé");
          expect(text).toContain(
            `data-countdown-end-date="${expectedCountdownEndDate}"`,
          );
        });

      expect(mailerMock.sentMails).toEqual([]);
    });

    it("should render an error page when sending the verification mail fails", async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({ ...getSessionServiceMock(), get: sessionGet })
          .overrideProvider(MailerService)
          .useValue({
            ...getMailerServiceMock(),
            sendMail: async () => {
              throw new Error("smtp down");
            },
          }),
      );
      const { app } = bench;

      await request(app.getHttpServer())
        .get("/verify-email")
        .expect(200)
        .expect(({ text }) => {
          expect(text).toContain(
            "Une erreur est survenue lors de l&#39;envoi de l&#39;e-mail de vérification. Veuillez réessayer plus tard.",
          );

          // no prior token exists here, so this exercises
          // computeCountdownEndDate's no-token (default-from-now)
          // branch, unlike the other cases which all seed one first.
          const [, renderedDate] =
            text.match(/data-countdown-end-date="([^"]+)"/) ?? [];
          const driftMs = Math.abs(
            new Date(renderedDate).getTime() - (Date.now() + COOLDOWN_MS),
          );
          expect(driftMs).toBeLessThan(5000);
        });
    });
  });

  describe("POST /verify-email", () => {
    it("should accept a valid token and redirect to interaction verify", async () => {
      const sessionSet = jest.fn();
      await using bench = await TestingBench.createTestBench((builder) =>
        builder.overrideProvider(SessionService).useValue({
          ...getSessionServiceMock(),
          get: sessionGet,
          set: sessionSet,
        }),
      );
      const { app } = bench;

      const model = app.get<Model<any>>(
        getModelToken("EmailVerificationToken"),
      );
      await model.create({ email, token: "01234567", sentAt: new Date() });

      await request(app.getHttpServer())
        .post("/verify-email")
        .send({ verify_email_token: "01234567", csrfToken: CSRF_TOKEN })
        .expect(302)
        .expect("Location", `/api/v2/interaction/${interactionId}/verify`);

      expect(sessionSet).toHaveBeenCalledWith("User", {
        isEmailVerifiedByPcf: true,
      });
    });

    it("should reject a mismatched token", async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({ ...getSessionServiceMock(), get: sessionGet }),
      );
      const { app } = bench;

      const model = app.get<Model<any>>(
        getModelToken("EmailVerificationToken"),
      );
      await model.create({ email, token: "11112222", sentAt: new Date() });

      await request(app.getHttpServer())
        .post("/verify-email")
        .send({ verify_email_token: "00009999", csrfToken: CSRF_TOKEN })
        // Nest pre-sets 201 for POST handlers; the exception filter
        // never calls res.status(), so it inherits that, not 200.
        .expect(201)
        .expect(({ text }) => {
          expect(text).toContain("Le code rentré est invalide ou expiré.");
        });
    });

    it("should reject with too many attempts once the rate limit is exhausted", async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({ ...getSessionServiceMock(), get: sessionGet }),
      );
      const { app } = bench;

      const model = app.get<Model<any>>(
        getModelToken("EmailVerificationToken"),
      );
      await model.create({ email, token: "11112222", sentAt: new Date() });

      // TEST_CONFIG's RateLimiter.rateLimiterParams for
      // VERIFY_EMAIL_TOKEN allows 10 attempts - each request consumes
      // one regardless of the token's own validity, so 10 wrong
      // attempts exhaust it before the 11th ever reaches the
      // token-comparison branch.
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post("/verify-email")
          .send({ verify_email_token: "00009999", csrfToken: CSRF_TOKEN })
          .expect(201);
      }

      await request(app.getHttpServer())
        .post("/verify-email")
        .send({ verify_email_token: "00009999", csrfToken: CSRF_TOKEN })
        .expect(201)
        .expect(({ text }) => {
          expect(text).toContain(
            "Vous avez dépassé le nombre de tentatives autorisées. Veuillez réessayer plus tard.",
          );
        });
    });
  });

  describe("POST /verify-email/resend", () => {
    it("should resend a verification email once the cooldown has passed", async () => {
      const mailerMock = getMailerServiceMock();
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({ ...getSessionServiceMock(), get: sessionGet })
          .overrideProvider(MailerService)
          .useValue(mailerMock),
      );
      const { app } = bench;

      const model = app.get<Model<any>>(
        getModelToken("EmailVerificationToken"),
      );
      // Cooldown (10 min) elapsed but not the 1h token expiry: a plain
      // GET would not resend here (requestSendEmail is false), only
      // the resend route's requestSendEmail: true flag makes it.
      const elevenMinutesAgo = new Date(Date.now() - 11 * 60 * 1000);
      await model.create({
        email,
        token: "12345678",
        sentAt: elevenMinutesAgo,
      });

      await request(app.getHttpServer())
        .post("/verify-email/resend")
        .send({ csrfToken: CSRF_TOKEN })
        .expect(201)
        .expect(({ text }) => {
          expect(text).toContain(email);
        });

      expect(mailerMock.sentMails).toEqual([
        expect.objectContaining({ to: email }),
      ]);
    });
  });
});
