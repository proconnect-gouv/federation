import { getModelToken } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import request from "supertest";

import { OidcClientService } from "@fc/oidc-client";
import { SessionService } from "@fc/session";

import {
  createActiveIdentityProvider,
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

const CSRF_TOKEN = "test-csrf-token";
const EMAIL_DOMAIN = "example.gouv.fr";
const EMAIL = `user@${EMAIL_DOMAIN}`;

// CsrfTokenGuard needs a real ("Csrf") answer, not just ("User").
function sessionGet(moduleName?: string) {
  if (moduleName === "Csrf") {
    return { csrfToken: CSRF_TOKEN };
  }
  return { ...AfterGetOidcCallbackSessionDocument, idpLoginHint: EMAIL };
}

describe("OidcClientController", () => {
  describe("GET /identity-provider-selection", () => {
    it("should render the identity provider selection view with the matching IdPs", async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({ ...getSessionServiceMock(), get: sessionGet }),
      );
      const { app } = bench;

      await createActiveIdentityProvider(app, Fia1IdentityProviderDocument, {
        attachedEmailDomains: [EMAIL_DOMAIN],
      });
      await createActiveIdentityProvider(
        app,
        MonCompteProIdentityProviderDocument,
        { attachedEmailDomains: [EMAIL_DOMAIN] },
      );

      await request(app.getHttpServer())
        .get("/identity-provider-selection")
        .expect(200)
        .expect("Content-Type", "text/html; charset=utf-8")
        .expect(({ text }) => {
          expect(text).toContain(Fia1IdentityProviderDocument.name);
          // MonComptePro's uid is TEST_CONFIG's App.defaultIdpId:
          // getSortedDisplayableIdentityProviders() overrides its
          // title to this fixed copy instead of the fixture's `name`.
          expect(text).toContain("Autre (via ProConnect Identité)");
          expect(text).toContain(`value="${CSRF_TOKEN}"`);
          // value-gates hasDefaultIdp: true (MonComptePro is the
          // default idp fixture), not just the provider list itself.
          expect(text).toContain(
            "Si votre administration n'est pas répertoriée, sélectionnez",
          );
        });
    });
  });

  describe("POST /identity-provider-selection", () => {
    const interaction = {
      jti: AfterGetOidcCallbackSessionDocument.interactionId,
      params: {
        client_id: Fsa1ServiceProviderDocument.key,
        state: "test-state",
        scope: "openid email",
      },
      prompt: { name: "login", reasons: [] },
    };

    it("should redirect to the mocked authorization URL and set the idp session", async () => {
      const sessionSet = jest.fn();
      const authorizationUrl = "https://fia1-low.example/authorize";
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({
            ...getSessionServiceMock(),
            get: sessionGet,
            set: sessionSet,
          })
          .overrideProvider(OidcClientService)
          .useValue({
            getAuthorizationUrl: jest.fn().mockResolvedValue({
              authorizationUrl,
              nonce: "test-nonce",
              state: "test-oidc-state",
              idpName: Fia1IdentityProviderDocument.name,
              idpLabel: Fia1IdentityProviderDocument.name,
            }),
          }),
      );
      const { app, redis } = bench;

      await createActiveIdentityProvider(app, Fia1IdentityProviderDocument, {
        attachedEmailDomains: [EMAIL_DOMAIN],
      });
      await createServiceProvider(app, Fsa1ServiceProviderDocument);
      await redis.set(
        `OIDC-P:Interaction:${AfterGetOidcCallbackSessionDocument.interactionId}`,
        JSON.stringify(interaction),
      );

      await request(app.getHttpServer())
        .post("/identity-provider-selection")
        .set(
          "Cookie",
          signOidcProviderCookie(
            "_interaction",
            AfterGetOidcCallbackSessionDocument.interactionId,
          ),
        )
        .send({
          identityProviderUid: Fia1IdentityProviderDocument.uid,
          csrfToken: CSRF_TOKEN,
        })
        .expect(302)
        .expect("Location", authorizationUrl);

      expect(sessionSet).toHaveBeenCalledWith("User", {
        idpId: Fia1IdentityProviderDocument.uid,
        idpName: Fia1IdentityProviderDocument.name,
        idpLabel: Fia1IdentityProviderDocument.name,
        idpNonce: "test-nonce",
        idpState: "test-oidc-state",
        idpIdentity: undefined,
        spIdentity: undefined,
      });
    });
  });

  describe("POST /redirect-to-idp", () => {
    const interaction = {
      jti: AfterGetOidcCallbackSessionDocument.interactionId,
      params: {
        client_id: Fsa1ServiceProviderDocument.key,
        state: "test-state",
        scope: "openid email",
      },
      prompt: { name: "login", reasons: [] },
    };

    it("should redirect to the mocked authorization URL when the email matches a single IdP", async () => {
      const sessionSet = jest.fn();
      const authorizationUrl = "https://fia1-low.example/authorize";
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({
            ...getSessionServiceMock(),
            get: sessionGet,
            set: sessionSet,
          })
          .overrideProvider(OidcClientService)
          .useValue({
            getAuthorizationUrl: jest.fn().mockResolvedValue({
              authorizationUrl,
              nonce: "test-nonce",
              state: "test-oidc-state",
              idpName: Fia1IdentityProviderDocument.name,
              idpLabel: Fia1IdentityProviderDocument.name,
            }),
          }),
      );
      const { app, redis } = bench;

      // Attached only to Fia1 - keeps selectIdpsFromEmail() to exactly
      // one match, so redirectToIdpWithEmail() delegates straight to
      // redirectToIdpWithIdpId() instead of the multi-idp branch.
      await createActiveIdentityProvider(app, Fia1IdentityProviderDocument, {
        attachedEmailDomains: [EMAIL_DOMAIN],
      });
      await createServiceProvider(app, Fsa1ServiceProviderDocument);
      await redis.set(
        `OIDC-P:Interaction:${AfterGetOidcCallbackSessionDocument.interactionId}`,
        JSON.stringify(interaction),
      );

      await request(app.getHttpServer())
        .post("/redirect-to-idp")
        .set(
          "Cookie",
          signOidcProviderCookie(
            "_interaction",
            AfterGetOidcCallbackSessionDocument.interactionId,
          ),
        )
        // RedirectToIdp's rememberMe only maps "on" (HTML checkbox
        // value) to true via its @Transform - a JSON boolean true
        // isn't recognized and silently becomes false.
        .send({ email: EMAIL, rememberMe: "on", csrfToken: CSRF_TOKEN })
        .expect(302)
        .expect("Location", authorizationUrl);

      // 1st call: redirectToIdpWithEmail's own precondition set.
      expect(sessionSet).toHaveBeenNthCalledWith(1, "User", {
        rememberMe: true,
        idpLoginHint: EMAIL,
      });
      // 2nd call: redirectToIdpWithIdpId's session payload, same shape
      // as the direct POST /identity-provider-selection case.
      expect(sessionSet).toHaveBeenNthCalledWith(2, "User", {
        idpId: Fia1IdentityProviderDocument.uid,
        idpName: Fia1IdentityProviderDocument.name,
        idpLabel: Fia1IdentityProviderDocument.name,
        idpNonce: "test-nonce",
        idpState: "test-oidc-state",
        idpIdentity: undefined,
        spIdentity: undefined,
      });
    });

    it("should redirect to the interaction page with an invalid_email error when no IdP/account/domain matches", async () => {
      const invalidEmail = "user@zzzz-nonexistent-domain-xyz.invalid";
      // computeIsDomainReachable() falls back to real DNS-over-HTTPS
      // fetch when no IdP/account/whitelist match is found - block it
      // here instead of letting a real network call happen; the
      // try/catch around it already treats a thrown fetch as "not
      // reachable", so this alone produces the invalid-email branch.
      const fetchSpy = jest
        .spyOn(global, "fetch")
        .mockRejectedValue(new Error("network calls are blocked in tests"));

      await using bench = await TestingBench.createTestBench((builder) =>
        builder.overrideProvider(SessionService).useValue({
          ...getSessionServiceMock(),
          get: sessionGet,
        }),
      );
      const { app, redis } = bench;

      await createServiceProvider(app, Fsa1ServiceProviderDocument);
      await redis.set(
        `OIDC-P:Interaction:${AfterGetOidcCallbackSessionDocument.interactionId}`,
        JSON.stringify(interaction),
      );

      await request(app.getHttpServer())
        .post("/redirect-to-idp")
        .set(
          "Cookie",
          signOidcProviderCookie(
            "_interaction",
            AfterGetOidcCallbackSessionDocument.interactionId,
          ),
        )
        .send({ email: invalidEmail, csrfToken: CSRF_TOKEN })
        .expect(302)
        .expect(
          "Location",
          `/api/v2/interaction/${AfterGetOidcCallbackSessionDocument.interactionId}?error=invalid_email&user_email=${encodeURIComponent(invalidEmail)}`,
        );

      expect(fetchSpy).toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  });

  describe("GET /oidc-callback", () => {
    it("should process the callback, persist a real account and redirect to verify", async () => {
      const sessionSet = jest.fn();
      const idpUserinfo = {
        sub: "idp-sub-1",
        given_name: "Jane",
        usual_name: "Doe",
        email: EMAIL,
        uid: "idp-uid-1",
        // no siret: exercises IdentitySanitizer.transformIdentity()'s
        // real fallback-to-the-idp's-own-siret branch.
      };
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(SessionService)
          .useValue({
            ...getSessionServiceMock(),
            get: () => ({
              ...AfterGetOidcCallbackSessionDocument,
              idpId: Fia1IdentityProviderDocument.uid,
              idpNonce: "test-nonce",
              idpState: "test-oidc-state",
            }),
            set: sessionSet,
          })
          .overrideProvider(OidcClientService)
          .useValue({
            getToken: jest.fn().mockResolvedValue({
              accessToken: "test-access-token",
              idToken: "test-id-token",
              claims: { acr: "eidas1", amr: ["pwd"] },
            }),
            getUserinfo: jest.fn().mockResolvedValue(idpUserinfo),
          }),
      );
      const { app } = bench;
      const oidcClient = app.get(OidcClientService);

      await createActiveIdentityProvider(app, Fia1IdentityProviderDocument);

      await request(app.getHttpServer())
        .get("/oidc-callback")
        .expect(302)
        .expect(
          "Location",
          `/api/v2/interaction/${AfterGetOidcCallbackSessionDocument.interactionId}/verify`,
        );

      // Proves the controller reads idpId/idpState/idpNonce/spId/spName
      // from the real session and forwards them unchanged.
      expect(oidcClient.getToken).toHaveBeenCalledWith({
        idpId: Fia1IdentityProviderDocument.uid,
        req: expect.anything(),
        idpState: "test-oidc-state",
        idpNonce: "test-nonce",
        spId: AfterGetOidcCallbackSessionDocument.spId,
        spName: AfterGetOidcCallbackSessionDocument.spName,
      });
      expect(oidcClient.getUserinfo).toHaveBeenCalledWith({
        accessToken: "test-access-token",
        idpId: Fia1IdentityProviderDocument.uid,
        claims: { acr: "eidas1", amr: ["pwd"] },
      });

      // Real AccountFcaService.getOrCreateAccount() Mongo write - first
      // real (non-stubbed) use of this service in the TestingBench
      // pattern, see oidc-client-controller-e2e/proposal.md.
      const accountModel = app.get<Model<any>>(getModelToken("AccountFca"));
      const account = await accountModel.findOne({
        idpIdentityKeys: {
          $elemMatch: { idpSub: idpUserinfo.sub, idpUid: Fia1IdentityProviderDocument.uid },
        },
      });
      expect(account).not.toBeNull();

      // 4 session.set calls in order: nonce/state cleared, idp token
      // fields, raw idp identity, final sp identity - each is a
      // distinct real write the unit spec asserted individually.
      expect(sessionSet).toHaveBeenNthCalledWith(1, "User", {
        idpNonce: null,
        idpState: null,
      });
      expect(sessionSet).toHaveBeenNthCalledWith(2, "User", {
        idpAmr: ["pwd"],
        idpIdToken: "test-id-token",
        idpAcr: "eidas1",
      });
      expect(sessionSet).toHaveBeenNthCalledWith(3, "User", {
        idpIdentity: expect.objectContaining({
          sub: "idp-sub-1",
          email: EMAIL,
          given_name: "Jane",
          usual_name: "Doe",
          uid: "idp-uid-1",
        }),
      });
      expect(sessionSet).toHaveBeenNthCalledWith(4, "User", {
        spIdentity: expect.objectContaining({
          sub: account.sub,
          email: EMAIL,
          given_name: "Jane",
          usual_name: "Doe",
          uid: "idp-uid-1",
          // fallback: idpUserinfo had no siret, so
          // transformIdentity() substituted the idp's own.
          siret: Fia1IdentityProviderDocument.siret,
          idp_id: Fia1IdentityProviderDocument.uid,
          idp_acr: "eidas1",
          custom: {},
          roles: expect.any(Array),
        }),
      });
    });
  });

  describe("GET /client/logout-callback", () => {
    // UserSessionDecorator (no DTO arg) still reads the full "User"
    // document to build `userSession` - a get() that unconditionally
    // returns undefined 500s before the controller's own logic runs.
    function logoutSessionGet(searchParams?: string) {
      return (moduleName?: string, key?: string) => {
        if (key === "orginalLogoutUrlSearchParamsFromSp") return searchParams;
        return AfterGetOidcCallbackSessionDocument;
      };
    }

    it("should redirect to the end-session URL without extra params when none are stored", async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder.overrideProvider(SessionService).useValue({
          ...getSessionServiceMock(),
          get: logoutSessionGet(undefined),
        }),
      );
      const { app } = bench;

      await request(app.getHttpServer())
        .get("/client/logout-callback")
        .expect(302)
        .expect("Location", "/api/v2/session/end?from_idp=true");
    });

    it("should append the stored search params when present", async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder.overrideProvider(SessionService).useValue({
          ...getSessionServiceMock(),
          get: logoutSessionGet("state=abc123"),
        }),
      );
      const { app } = bench;

      await request(app.getHttpServer())
        .get("/client/logout-callback")
        .expect(302)
        .expect(
          "Location",
          "/api/v2/session/end?from_idp=true&state=abc123",
        );
    });
  });
});
