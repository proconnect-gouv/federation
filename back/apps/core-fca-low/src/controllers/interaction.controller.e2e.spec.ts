import request from "supertest";

import { AccountFcaService } from "@fc/account-fca";
import { OidcProviderService } from "@fc/oidc-provider";
import { SessionService } from "@fc/session";

import {
  createIdentityProvider,
  Fia1IdentityProviderDocument,
} from "@mocks/identity-provider-adapter-mongo";
import {
  AfterGetOidcCallbackSessionDocument,
  getSessionServiceMock,
} from "@mocks/session";
import {
  createServiceProvider,
  Fsa1ServiceProviderDocument,
} from "@mocks/service-provider-adapter-mongo";

import { signOidcProviderCookie } from "../../.mocks/oidc-provider-cookie";
import { TestingBench } from "../test-bench";

describe("InteractionController", () => {
  describe("GET /", () => {
    it("should redirect to the configured defaultRedirectUri", async () => {
      await using bench = await TestingBench.createTestBench();
      const { app } = bench;

      await request(app.getHttpServer())
        .get("/")
        .expect(301)
        .expect("Location", "https://www.proconnect.gouv.fr");
    });
  });

  describe("GET /interaction/:uid", () => {
    const interaction = {
      uid: "1234567890-1234567890",
      params: {
        client_id: Fsa1ServiceProviderDocument.key,
        state: "test-state",
        scope: "openid email",
      },
      prompt: {
        name: "login",
        reasons: [],
      },
    };

    it("should render the interaction page", async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      await redis.set(
        "OIDC-P:Interaction:1234567890-1234567890",
        JSON.stringify(interaction),
      );

      await request(app.getHttpServer())
        .get("/interaction/1234567890-1234567890")
        .set(
          "Cookie",
          signOidcProviderCookie("_interaction", "1234567890-1234567890"),
        )
        .expect(200)
        .expect("Content-Type", "text/html; charset=utf-8")
        .expect(({ text }) => {
          expect(text).toContain("Choix du compte - ProConnect");
          expect(text).toContain("Se connecter ou s'inscrire");
          expect(text).toContain(Fsa1ServiceProviderDocument.name);
        });
    });
  });

  describe("GET /interaction/:uid/verify", () => {
    it("should redirect back to the interaction when the IdP is inactive", async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({
            ...getSessionServiceMock(),
            // Full valid AfterGetOidcCallbackSessionDto shape: UserSessionDecorator
            // runs class-validator on this before the controller executes.
            get: () => AfterGetOidcCallbackSessionDocument,
          })
          .overrideProvider(AccountFcaService)
          .useValue({ getAccountBySub: async () => ({ active: true }) }),
      );
      const { app } = bench;

      // Fia1IdentityProviderDocument has no `active` field, so isActiveById() resolves false.
      await createIdentityProvider(app, Fia1IdentityProviderDocument);

      await request(app.getHttpServer())
        .get("/interaction/1234567890-1234567890/verify")
        .expect(302)
        .expect("Location", "/api/v2/interaction/1234567890-1234567890");
    });
  });

  describe("GET /interaction/:uid/error", () => {
    it("should call abortInteraction with the error query params", async () => {
      await using bench = await TestingBench.createTestBench();
      const { app } = bench;

      // OidcProviderService is used app-wide (middleware registration on
      // boot), so it can't be swapped via overrideProvider - spy on the
      // real, already-booted instance instead. Real interactionFinished()
      // needs full provider-internal state beyond route-level smoke scope.
      const abortInteraction = jest
        .spyOn(app.get(OidcProviderService), "abortInteraction")
        .mockImplementation(async (_req, res) => {
          res.redirect(302, "https://stub.example/aborted");
        });

      await request(app.getHttpServer())
        .get(
          "/interaction/1234567890-1234567890/error?error=access_denied&error_description=nope",
        )
        .expect(302)
        .expect("Location", "https://stub.example/aborted");

      expect(abortInteraction).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { error: "access_denied", error_description: "nope" },
      );
    });
  });
});
