import request from "supertest";

import { OidcProviderService } from "@fc/oidc-provider";
import { SessionBackendStorageService } from "@fc/session/services/session-backend-storage.service";

import {
  FakeIdentityProvider,
  Fia1IdentityProviderDocument,
  MonCompteProIdentityProviderDocument,
} from "@mocks/identity-provider-adapter-mongo";
import {
  FakeServiceProvider,
  Fsa1ServiceProviderDocument,
} from "@mocks/service-provider-adapter-mongo";
import {
  AfterGetOidcCallbackSessionDocument,
  SessionBuilder,
} from "@mocks/session";

import TEST_CONFIG from "../../.mocks/config";
import { interactionCookieHeader } from "../../.mocks/oidc-provider-cookie";
import {
  defaultInteraction,
  seedInteraction,
} from "../../.mocks/oidc-provider-interaction";
import { TestingBench } from "../test-bench";

const INTERACTION_UID = "1234567890-1234567890";

function sessionCookieHeader(cookie: string): string {
  return `${TEST_CONFIG.Session.sessionCookieName}=${cookie}`;
}

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
    // oidc-provider's Interaction model reads its own id from the
    // stored payload's `jti` field (`.uid` is a getter aliasing
    // `.jti`, see node_modules/oidc-provider/lib/models/interaction.js)
    // — the redis key's uid suffix is only used for the initial
    // lookup, not to populate this field.
    const interaction = defaultInteraction(INTERACTION_UID);

    it("should render the interaction page", async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      await FakeServiceProvider.create().seed(app);

      await seedInteraction(redis, INTERACTION_UID, interaction);

      const response = await request(app.getHttpServer())
        .get(`/interaction/${INTERACTION_UID}`)
        .set("Cookie", interactionCookieHeader(INTERACTION_UID))
        .expect(200)
        .expect("Content-Type", "text/html; charset=utf-8")
        .expect(({ text }) => {
          expect(text).toContain("Choix du compte - ProConnect");
          expect(text).toContain("Se connecter ou s'inscrire");
          expect(text).toContain(Fsa1ServiceProviderDocument.name);
        });

      const setCookie = response
        .get("Set-Cookie")
        ?.find((c) =>
          c.startsWith(`${TEST_CONFIG.Session.sessionCookieName}=`),
        );
      expect(setCookie).toContain("HttpOnly");
      expect(setCookie).toContain("Secure");
      expect(setCookie).toContain("SameSite=Lax");
    });

    it("should abort interaction when idp_hint is not found", async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      await FakeServiceProvider.create().seed(app);

      await seedInteraction(
        redis,
        INTERACTION_UID,
        defaultInteraction(INTERACTION_UID, {
          idp_hint: "non-existent-idp-id",
        }),
      );

      const abortInteraction = jest
        .spyOn(app.get(OidcProviderService), "abortInteraction")
        .mockImplementation(async (_req, res) => {
          res.redirect(302, "https://stub.example/aborted");
        });

      await request(app.getHttpServer())
        .get(`/interaction/${INTERACTION_UID}`)
        .set("Cookie", interactionCookieHeader(INTERACTION_UID))
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
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      await FakeServiceProvider.create().seed(app);

      await seedInteraction(redis, INTERACTION_UID, interaction);

      // Full valid ActiveUserSessionDto shape (AfterGetOidcCallbackSessionDto
      // + interactionAcr): UserSessionDecorator runs class-validator on this
      // before the controller executes.
      const sessionCookie = await SessionBuilder.create()
        .withUser({
          ...AfterGetOidcCallbackSessionDocument,
          interactionAcr: "eidas1",
        })
        .buildSignedSessionCookie(app);

      await request(app.getHttpServer())
        .get(`/interaction/${INTERACTION_UID}`)
        .set(
          "Cookie",
          `${sessionCookieHeader(sessionCookie)}; ${interactionCookieHeader(INTERACTION_UID)}`,
        )
        .expect(302)
        .expect("Location", `/api/v2/interaction/${INTERACTION_UID}/verify`);
    });

    it("should redirect to the real authorization URL when idp_hint identifies an active idp", async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      // discovery: false + static legacy endpoints -> getAuthorizationUrl()
      // builds the URL from local config, no network call (same seam used
      // in oidc-client.controller.e2e.spec.ts's state-validation cases).
      await FakeIdentityProvider.create(Fia1IdentityProviderDocument)
        .withFields({
          authzURL: "https://fake-fia1-test.example/authorize",
          discovery: false,
          jwksURL: "https://fake-fia1-test.example/jwks",
          tokenURL: "https://fake-fia1-test.example/token",
          url: "https://fake-fia1-test.example",
          userInfoURL: "https://fake-fia1-test.example/userinfo",
        })
        .seed(app);
      await FakeServiceProvider.create().seed(app);

      await seedInteraction(
        redis,
        INTERACTION_UID,
        defaultInteraction(INTERACTION_UID, {
          idp_hint: Fia1IdentityProviderDocument.uid,
        }),
      );

      const response = await request(app.getHttpServer())
        .get(`/interaction/${INTERACTION_UID}`)
        .set("Cookie", interactionCookieHeader(INTERACTION_UID))
        .expect(302);

      expect(response.headers.location).toMatch(
        /^https:\/\/fake-fia1-test\.example\/authorize\?/,
      );
    });

    it("should redirect to identity-provider-selection when login_hint matches multiple identity providers", async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      const sharedDomain = "multi-idp-example.fr";
      await FakeIdentityProvider.create(Fia1IdentityProviderDocument)
        .withFields({ attachedEmailDomains: [sharedDomain] })
        .seed(app);
      await FakeIdentityProvider.create(MonCompteProIdentityProviderDocument)
        .withFields({ attachedEmailDomains: [sharedDomain] })
        .seed(app);
      await FakeServiceProvider.create().seed(app);

      await seedInteraction(
        redis,
        INTERACTION_UID,
        defaultInteraction(INTERACTION_UID, {
          login_hint: `user@${sharedDomain}`,
        }),
      );

      await request(app.getHttpServer())
        .get(`/interaction/${INTERACTION_UID}`)
        .set("Cookie", interactionCookieHeader(INTERACTION_UID))
        .expect(302)
        .expect("Location", "/api/v2/identity-provider-selection");
    });

    it("should really erase stale idp/sp session fields when the session is not reused, not just call clear()", async () => {
      // Real SessionService (no overrideProvider) so clear()'s effect
      // round-trips through the actual middleware/storage stack — the
      // erase itself is proven, not a mock call count. secure:false is
      // local to this test only (configOverrides, not shared
      // TEST_CONFIG): superagent's cookie jar drops Secure cookies over
      // plain HTTP (bench_gotchas.md).
      await using bench = await TestingBench.createTestBench(undefined, {
        Session: {
          ...TEST_CONFIG.Session,
          cookieOptions: {
            ...TEST_CONFIG.Session.cookieOptions,
            secure: false,
          },
        },
      });
      const { app, redis } = bench;

      await FakeServiceProvider.create().seed(app);
      await seedInteraction(redis, INTERACTION_UID, interaction);

      const agent = request.agent(app.getHttpServer());

      // Prime a real session: any middleware-included route issues a
      // real signed Set-Cookie, captured by the agent's jar and resent
      // on every later call. /interaction/:uid/error doesn't touch
      // userSession, so it can't interfere with the session seeded below.
      jest
        .spyOn(app.get(OidcProviderService), "abortInteraction")
        .mockImplementation(async (_req, res) => {
          res.redirect(302, "https://stub.example/primed");
        });
      const priming = await agent
        .get(`/interaction/${INTERACTION_UID}/error`)
        .expect(302);
      const sessionId = SessionBuilder.readRotatedSessionId(app, priming);

      // Overwrite that real session's backend data directly with the
      // stale fixture - same primitive SessionBuilder.buildSignedSessionCookie()
      // uses, just targeting the id the app itself generated instead of a
      // fabricated one. AfterGetOidcCallbackSessionDocument has no
      // interactionAcr, so isUserConnectedAlready is false regardless of
      // anything else -> canReuseActiveSession is false -> userSession.clear()
      // runs before the new interaction-scoped fields are merged in.
      await app
        .get(SessionBackendStorageService)
        .save(sessionId, { User: AfterGetOidcCallbackSessionDocument });

      // interactionCookieHeader (oidc-provider's own _interaction cookie)
      // isn't in the jar - still needs setting manually.
      await agent
        .get(`/interaction/${INTERACTION_UID}`)
        .set("Cookie", interactionCookieHeader(INTERACTION_UID))
        .expect(200);

      // If clear() really emptied idpId/spIdentity/etc, this request's own
      // AfterGetOidcCallbackSessionDto validation (in UserSessionDecorator,
      // before getVerify() even runs) fails, and InvalidSessionExceptionFilter
      // redirects back to /interaction/:uid. Had clear() been a no-op, the
      // stale fields would still validate, and the controller would reach
      // the real (unseeded) AccountFcaService lookup for the stale
      // spIdentity.sub instead, rendering the "Accès impossible" page.
      await agent
        .get(`/interaction/${INTERACTION_UID}/verify`)
        .set("Cookie", interactionCookieHeader(INTERACTION_UID))
        .expect(302)
        .expect("Location", `/api/v2/interaction/${INTERACTION_UID}`);
    });
  });
});
