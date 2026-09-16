import request from "supertest";

import { AccountFcaService } from "@fc/account-fca";
import { OidcProviderService } from "@fc/oidc-provider";
import { SessionService } from "@fc/session";

import {
  createActiveIdentityProvider,
  createIdentityProvider,
  Fia1IdentityProviderDocument,
  MonCompteProIdentityProviderDocument,
} from "@mocks/identity-provider-adapter-mongo";
import {
  createServiceProvider,
  Fsa1ServiceProviderDocument,
} from "@mocks/service-provider-adapter-mongo";
import {
  AfterGetOidcCallbackSessionDocument,
  getSessionServiceMock,
} from "@mocks/session";

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
      // oidc-provider's Interaction model reads its own id from the
      // stored payload's `jti` field (`.uid` is a getter aliasing
      // `.jti`, see node_modules/oidc-provider/lib/models/interaction.js)
      // — the redis key's uid suffix is only used for the initial
      // lookup, not to populate this field.
      jti: "1234567890-1234567890",
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

    it("should abort interaction when idp_hint is not found", async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      await redis.set(
        "OIDC-P:Interaction:1234567890-1234567890",
        JSON.stringify({
          ...interaction,
          params: { ...interaction.params, idp_hint: "non-existent-idp-id" },
        }),
      );

      const abortInteraction = jest
        .spyOn(app.get(OidcProviderService), "abortInteraction")
        .mockImplementation(async (_req, res) => {
          res.redirect(302, "https://stub.example/aborted");
        });

      await request(app.getHttpServer())
        .get("/interaction/1234567890-1234567890")
        .set(
          "Cookie",
          signOidcProviderCookie("_interaction", "1234567890-1234567890"),
        )
        .expect(302)
        .expect("Location", "https://stub.example/aborted");

      expect(abortInteraction).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        {
          error: "idp_hint_not_found",
          error_description: "provided idp_hint could not be found",
        },
      );
    });

    it("should redirect to verify when the session is reused", async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder.overrideProvider(SessionService).useValue({
          ...getSessionServiceMock(),
          // Full valid ActiveUserSessionDto shape (AfterGetOidcCallbackSessionDto
          // + interactionAcr): UserSessionDecorator runs class-validator on this
          // before the controller executes.
          get: () => ({
            ...AfterGetOidcCallbackSessionDocument,
            interactionAcr: "eidas1",
          }),
        }),
      );
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
        .expect(302)
        .expect("Location", "/api/v2/interaction/1234567890-1234567890/verify");
    });

    it("should redirect to identity-provider-selection when login_hint matches multiple identity providers", async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      const sharedDomain = "multi-idp-example.fr";
      await createActiveIdentityProvider(app, Fia1IdentityProviderDocument, {
        attachedEmailDomains: [sharedDomain],
      });
      await createActiveIdentityProvider(
        app,
        MonCompteProIdentityProviderDocument,
        { attachedEmailDomains: [sharedDomain] },
      );
      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      await redis.set(
        "OIDC-P:Interaction:1234567890-1234567890",
        JSON.stringify({
          ...interaction,
          params: {
            ...interaction.params,
            login_hint: `user@${sharedDomain}`,
          },
        }),
      );

      await request(app.getHttpServer())
        .get("/interaction/1234567890-1234567890")
        .set(
          "Cookie",
          signOidcProviderCookie("_interaction", "1234567890-1234567890"),
        )
        .expect(302)
        .expect("Location", "/api/v2/identity-provider-selection");
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

    it("should call abortInteraction when the IdP is inactive during silent authentication", async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({
            ...getSessionServiceMock(),
            get: () => ({
              ...AfterGetOidcCallbackSessionDocument,
              isSilentAuthentication: true,
            }),
          })
          .overrideProvider(AccountFcaService)
          .useValue({ getAccountBySub: async () => ({ active: true }) }),
      );
      const { app } = bench;

      // Fia1IdentityProviderDocument has no `active` field, so isActiveById() resolves false.
      await createIdentityProvider(app, Fia1IdentityProviderDocument);

      const abortInteraction = jest
        .spyOn(app.get(OidcProviderService), "abortInteraction")
        .mockImplementation(async (_req, res) => {
          res.redirect(302, "https://stub.example/aborted");
        });

      await request(app.getHttpServer())
        .get("/interaction/1234567890-1234567890/verify")
        .expect(302)
        .expect("Location", "https://stub.example/aborted");

      expect(abortInteraction).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        {
          error: "login_required",
          error_description: "end-user authentication is required",
        },
      );
    });

    it("should reject a private sector identity for a public-only service provider", async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({
            ...getSessionServiceMock(),
            get: () => ({
              ...AfterGetOidcCallbackSessionDocument,
              spIdentity: {
                ...AfterGetOidcCallbackSessionDocument.spIdentity,
                roles: [],
              },
            }),
          })
          .overrideProvider(AccountFcaService)
          .useValue({ getAccountBySub: async () => ({ active: true }) }),
      );
      const { app } = bench;

      // Genuinely active, so isActiveById() resolves true and the
      // controller reaches the service-provider-type / role check.
      await createActiveIdentityProvider(app, Fia1IdentityProviderDocument);
      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      await request(app.getHttpServer())
        .get("/interaction/1234567890-1234567890/verify")
        .expect(400)
        .expect(({ text }) => {
          expect(text).toContain(
            "L'accès à ce site est limité aux agentes et agents représentant officiellement une administration publique.",
          );
        });
    });

    it("should abort interaction when the essential ACR cannot be satisfied", async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({
            ...getSessionServiceMock(),
            get: () => ({
              ...AfterGetOidcCallbackSessionDocument,
              spEssentialAcr: "eidas3",
            }),
          })
          .overrideProvider(AccountFcaService)
          .useValue({ getAccountBySub: async () => ({ active: true }) }),
      );
      const { app } = bench;

      await createActiveIdentityProvider(app, Fia1IdentityProviderDocument);
      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      const abortInteraction = jest
        .spyOn(app.get(OidcProviderService), "abortInteraction")
        .mockImplementation(async (_req, res) => {
          res.redirect(302, "https://stub.example/aborted");
        });

      await request(app.getHttpServer())
        .get("/interaction/1234567890-1234567890/verify")
        .expect(302)
        .expect("Location", "https://stub.example/aborted");

      expect(abortInteraction).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        {
          error: "access_denied",
          error_description: "requested ACRs could not be satisfied",
        },
      );
    });

    it("should accept a valid session and finish the interaction", async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({
            ...getSessionServiceMock(),
            get: () => AfterGetOidcCallbackSessionDocument,
          })
          .overrideProvider(AccountFcaService)
          .useValue({ getAccountBySub: async () => ({ active: true }) }),
      );
      const { app, redis } = bench;

      await createActiveIdentityProvider(app, Fia1IdentityProviderDocument);
      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      await redis.set(
        "OIDC-P:Interaction:1234567890-1234567890",
        JSON.stringify({
          uid: "1234567890-1234567890",
          params: {
            client_id: Fsa1ServiceProviderDocument.key,
            redirect_uri: Fsa1ServiceProviderDocument.redirect_uris[0],
            state: "test-state",
            scope: "openid email",
            response_type: "code",
          },
          prompt: { name: "login", reasons: [] },
          returnTo:
            "http://localhost:3000/auth/callback?interactionId=1234567890-1234567890",
        }),
      );

      await request(app.getHttpServer())
        .get("/interaction/1234567890-1234567890/verify")
        .set(
          "Cookie",
          signOidcProviderCookie("_interaction", "1234567890-1234567890"),
        )
        .expect(303)
        .expect(
          "Location",
          "http://localhost:3000/auth/callback?interactionId=1234567890-1234567890",
        );
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
