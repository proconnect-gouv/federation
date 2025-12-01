import * as cookieSignature from 'cookie-signature';
import type { IdTokenClaims } from 'openid-client';
import { cloneDeep, isUndefined, omitBy, set } from 'lodash';
import { randomBytes } from 'node:crypto';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { ConfigService } from '@fc/config';
import type { SessionConfig } from '@fc/session';
import { SessionBackendStorageService } from '@fc/session/services/session-backend-storage.service';

/**
 * Session builder with fluent API
 * Handles session configuration and signing
 *
 * @example
 * ```typescript
 * const sessionRef = SessionBuilder.create()
 *   .withServiceProvider(Fsa1ServiceProviderDocument)
 *   .withIdentityProvider(Fia1IdentityProviderDocument)
 *   .withUserInfo({
 *     sub: '1234567890',
 *     given_name: 'Test',
 *     usual_name: 'User',
 *     email: 'test@example.com',
 *     uid: '1234567890',
 *     siren: '123456789',
 *     siret: '13002526500013',
 *   })
 *   .withIdTokenClaims({ acr: 'eidas1', amr: ['pwd'] })
 *   .withInteractionId('interaction-uid');
 *
 * const signedCookie = await sessionRef.buildSignedSessionCookie(app);
 * ```
 */
export class SessionBuilder {
  private sessionId: string;

  private constructor(private data: Record<string, unknown>) {}

  /**
   * Get the built session data
   */
  build(): Record<string, unknown> {
    return cloneDeep(this.data);
  }

  /**
   * Create a new session builder with minimal session data
   */
  static create(): SessionBuilder {
    return new SessionBuilder({
      Csrf: {
        csrfToken: randomBytes(32).toString('hex'),
      },
    }).setSessionId(randomBytes(32).toString('hex'));
  }

  /**
   * Set a property on the session data.
   * @param path The path of the property to set.
   * @param value The value to set.
   * @return Returns object.
   */
  set(path: string, value: any): this {
    set(this.data, path, value);
    return this;
  }

  /**
   * Set session ID (usually auto-generated)
   */
  private setSessionId(sessionId: string): this {
    this.sessionId = sessionId;
    return this;
  }

  /**
   * Save session to backend storage and return signed cookie
   * @param app NestExpressApplication instance
   * @returns Signed cookie value
   */
  async buildSignedSessionCookie(app: NestExpressApplication): Promise<string> {
    const { sessionId } = this;
    const sessionData = this.build();
    const storageService = app.get(SessionBackendStorageService);

    // Save to storage
    await storageService.save(sessionId, sessionData);

    // Get session config to access cookie secrets
    const config = app.get(ConfigService);
    const { cookieSecrets } = config.get<SessionConfig>('Session');

    // Sign the session ID using the first secret
    // cookieSignature.sign() returns "value.signature" format
    const signedValue = cookieSignature.sign(sessionId, cookieSecrets[0]);

    // Cookie-parser expects signed cookies prefixed with "s:"
    return `s:${signedValue}`;
  }

  /**
   * Set service provider from document
   */
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
    if (spData.name) {
      user.spName = spData.name;
    }
    // Set default spEssentialAcr for /verify endpoint
    user.spEssentialAcr = 'eidas1';
    return this;
  }

  /**
   * Set identity provider metadata from document
   * Only sets IdP metadata (id, name, label, token, nonce, state)
   * Does NOT set identity data - use withUserInfo() for that
   */
  withIdentityProvider(idpData: {
    uid: string;
    name: string;
    title: string;
  }): this {
    const user = (this.data.User ??= {}) as any;
    user.idpId = idpData.uid;
    user.idpName = idpData.name;
    user.idpLabel = idpData.title;
    user.idpIdToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkiLCJpZHAiOiJmaWExLWxvdyIsImlhdCI6MTUxNjIzOTAyMn0.gT6b5BWd4FS5HwHs6VhqmdaI1NNxWn84F2nS46QKJ3o';
    user.idpNonce = 'test-nonce';
    user.idpState = 'test-state';
    return this;
  }

  /**
   * Set user identity from userInfo-like data
   * Creates both idpIdentity and spIdentity from the provided data
   * Mimics the production flow: userInfo → idpIdentity → spIdentity
   *
   * @param userInfo - User info data (should include at minimum: sub, given_name, usual_name, email, uid)
   */
  withUserInfo(userInfo: {
    sub: string;
    given_name: string;
    usual_name: string;
    email: string;
    uid: string;
    siren?: string;
    siret?: string;
    organizational_unit?: string;
    belonging_population?: string;
    is_service_public?: boolean;
    [key: string]: any;
  }): this {
    const user = (this.data.User ??= {}) as any;

    // Create idpIdentity (validated userInfo)
    user.idpIdentity = omitBy(userInfo, isUndefined);

    // Create spIdentity from idpIdentity
    // Preserve any existing spIdentity fields (e.g., idp_acr from withIdTokenClaims)
    user.spIdentity = {
      ...user.spIdentity,
      ...user.idpIdentity,
      idp_id: user.idpId,
      custom: user.spIdentity?.custom ?? {},
    };
    user.interactionAcr = 'eidas1';

    return this;
  }

  /**
   * Set token claims from IDP (acr, amr)
   */
  withIdTokenClaims(claims: Partial<IdTokenClaims>): this {
    const user = (this.data.User ??= {}) as any;
    if (claims.acr) {
      user.idpAcr = claims.acr;
      user.spIdentity ??= {};
      user.spIdentity.idp_acr = claims.acr;
    }
    if (claims.amr) {
      user.amr = claims.amr;
    }
    return this;
  }

  /**
   * Set interaction ID
   */
  withInteractionId(interactionId: string): this {
    const user = (this.data.User ??= {}) as any;
    user.interactionId = interactionId;
    return this;
  }
}
