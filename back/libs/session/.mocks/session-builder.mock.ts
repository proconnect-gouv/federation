import * as cookieSignature from "cookie-signature";
import { cloneDeep } from "lodash";
import { randomBytes } from "node:crypto";

import { ConfigService } from "@fc/config";
import type { SessionConfig } from "@fc/session";
import { SessionBackendStorageService } from "@fc/session/services/session-backend-storage.service";
import type { NestExpressApplication } from "@nestjs/platform-express";

/**
 * Real session: SessionBackendStorageService.save() (encrypted, real
 * Redis write) + cookie-signature (matches cookie-parser's `secret`
 * verification) - not a SessionService DI override. Use when a spec's
 * bug surface includes cookie/session read-write itself (e.g. a
 * controller's own session.set() call sequence); for everything else
 * getSessionServiceMock() + overrideProvider(SessionService) is cheaper.
 *
 * @example
 * const cookie = await SessionBuilder.create()
 *   .withServiceProvider(Fsa1ServiceProviderDocument)
 *   .withIdentityProvider(Fia1IdentityProviderDocument)
 *   .withInteractionId(interactionId)
 *   .buildSignedSessionCookie(app);
 *
 * await request(app.getHttpServer()).get("/oidc-callback").set("Cookie", cookie);
 */
export class SessionBuilder {
  private sessionId: string;

  private constructor(private data: Record<string, unknown>) {}

  static create(): SessionBuilder {
    return new SessionBuilder({
      Csrf: { csrfToken: randomBytes(32).toString("hex") },
    }).setSessionId(randomBytes(32).toString("hex"));
  }

  build(): Record<string, unknown> {
    return cloneDeep(this.data);
  }

  get id(): string {
    return this.sessionId;
  }

  private setSessionId(sessionId: string): this {
    this.sessionId = sessionId;
    return this;
  }

  async buildSignedSessionCookie(app: NestExpressApplication): Promise<string> {
    const { sessionId } = this;
    const storageService = app.get(SessionBackendStorageService);
    await storageService.save(sessionId, this.build());

    const config = app.get(ConfigService);
    const { cookieSecrets } = config.get<SessionConfig>("Session");
    const signedValue = cookieSignature.sign(sessionId, cookieSecrets[0]);

    return `s:${signedValue}`;
  }

  /**
   * Some routes rotate the session id mid-request (session-fixation
   * mitigation, e.g. oidc-client.controller's oidcCallback calls
   * userSession.duplicate()) and issue a new Set-Cookie - the id you
   * signed going in is no longer the one holding the final state.
   * Read it back from the response instead of the original id.
   */
  static readRotatedSessionId(
    app: NestExpressApplication,
    response: { get(header: "Set-Cookie"): string[] | undefined },
  ): string {
    const config = app.get(ConfigService);
    const { sessionCookieName, cookieSecrets } =
      config.get<SessionConfig>("Session");

    const rotatedCookie = (response.get("Set-Cookie") ?? [])
      .map((cookieString) => cookieString.split(";")[0])
      .find((cookieString) => cookieString.startsWith(`${sessionCookieName}=`));
    if (!rotatedCookie) {
      throw new Error("Expected a rotated session cookie on the response");
    }

    const [, signedValue] = rotatedCookie.split("=");
    const sessionId = cookieSignature.unsign(
      decodeURIComponent(signedValue).slice(2),
      cookieSecrets[0],
    );
    if (sessionId === false) {
      throw new Error("Rotated session cookie failed signature check");
    }

    return sessionId;
  }

  withServiceProvider(spData: {
    client_id?: string;
    clientID?: string;
    id?: string;
    key?: string;
    name?: string;
  }): this {
    const user = (this.data.User ??= {}) as any;
    user.spId =
      spData.key ||
      spData.client_id ||
      spData.clientID ||
      spData.id ||
      user.spId;
    if (spData.name) user.spName = spData.name;
    user.spEssentialAcr = "eidas1";
    return this;
  }

  withIdentityProvider(idpData: {
    uid: string;
    name: string;
    title?: string;
  }): this {
    const user = (this.data.User ??= {}) as any;
    user.idpId = idpData.uid;
    user.idpName = idpData.name;
    user.idpLabel = idpData.title ?? idpData.name;
    user.idpNonce = "test-nonce";
    user.idpState = "test-state";
    return this;
  }

  withInteractionId(interactionId: string): this {
    const user = (this.data.User ??= {}) as any;
    user.interactionId = interactionId;
    return this;
  }

  /**
   * Merge arbitrary fields into the "User" module - same shallow-merge
   * semantics as the real SessionService.set("User", partial). Use
   * when no with*() method covers the shape a session-validating
   * decorator needs (e.g. ActiveUserSessionDto's full field set).
   */
  withUser(partial: Record<string, unknown>): this {
    const user = (this.data.User ??= {}) as any;
    Object.assign(user, partial);
    return this;
  }
}

/**
 * Repeated identically across TestingBench e2e specs that build a
 * session via SessionBuilder - `session.build().Csrf.csrfToken`.
 */
export function csrfTokenOf(session: SessionBuilder): string {
  return (session.build().Csrf as { csrfToken: string }).csrfToken;
}

/**
 * Signs the session and formats it as a "name=value" Cookie header -
 * repeated identically across TestingBench e2e specs.
 */
export async function sessionCookieHeader(
  app: NestExpressApplication,
  session: SessionBuilder,
): Promise<string> {
  const cookie = await session.buildSignedSessionCookie(app);
  const config = app.get(ConfigService);
  const { sessionCookieName } = config.get<SessionConfig>("Session");
  return `${sessionCookieName}=${cookie}`;
}
