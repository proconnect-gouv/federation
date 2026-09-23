import request from "supertest";

import { OidcProviderService } from "@fc/oidc-provider";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { SessionBuilder } from "@mocks/session";

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

describe("InvalidSessionExceptionFilter", () => {
  // UserSessionDecorator(AfterGetOidcCallbackSessionDto) runs class-
  // validator on the session before getVerify() executes - withUser({})
  // keeps "User" a valid object (SessionBackendStorageService's own
  // read-time check requires that much) while leaving every
  // @IsDefined() field (idpId, idpIdToken, spIdentity, ...) undefined,
  // so it always throws InvalidSessionException regardless of route
  // body logic.
  async function brokenSessionCookie(
    app: NestExpressApplication,
  ): Promise<string> {
    return SessionBuilder.create().withUser({}).buildSignedSessionCookie(app);
  }

  it("restarts the interaction when oidc-provider still has it", async () => {
    await using bench = await TestingBench.createTestBench();
    const { app, redis } = bench;

    await seedInteraction(
      redis,
      INTERACTION_UID,
      defaultInteraction(INTERACTION_UID),
    );
    const sessionCookie = await brokenSessionCookie(app);

    await request(app.getHttpServer())
      .get(`/interaction/${INTERACTION_UID}/verify`)
      .set(
        "Cookie",
        `${sessionCookieHeader(sessionCookie)}; ${interactionCookieHeader(INTERACTION_UID)}`,
      )
      .expect(302)
      .expect("Location", `/api/v2/interaction/${INTERACTION_UID}`);
  });

  it("renders the oidc-provider session-not-found error page when the interaction is gone too", async () => {
    await using bench = await TestingBench.createTestBench();
    const { app } = bench;

    // No oidc-provider `_interaction` cookie at all: real
    // provider.interactionDetails() throws SessionNotFound
    // ("interaction session id cookie not found") - the filter
    // delegates that to OidcProviderSessionNotFoundExceptionFilter
    // instead of redirecting back to the interaction.
    const sessionCookie = await brokenSessionCookie(app);

    await request(app.getHttpServer())
      .get(`/interaction/${INTERACTION_UID}/verify`)
      .set("Cookie", sessionCookieHeader(sessionCookie))
      .expect(400)
      .expect(({ text }) => {
        expect(text).toContain("Nous n’arrivons pas à vous connecter");
      });
  });

  it("renders a generic 500 error page when getInteraction fails for an unrelated reason", async () => {
    await using bench = await TestingBench.createTestBench();
    const { app } = bench;

    // Any error other than oidc-provider's own SessionNotFound falls
    // through to the filter's generic fallback (wraps it as an
    // InternalServerErrorException, delegates to HttpExceptionFilter)
    // instead of the two branches above.
    jest
      .spyOn(app.get(OidcProviderService), "getInteraction")
      .mockRejectedValueOnce(new Error("boom"));
    const sessionCookie = await brokenSessionCookie(app);

    await request(app.getHttpServer())
      .get(`/interaction/${INTERACTION_UID}/verify`)
      .set("Cookie", sessionCookieHeader(sessionCookie))
      .expect(500)
      .expect(({ text }) => {
        expect(text).toContain("code-y000500");
      });
  });
});
