import * as jose from "jose";

import type { INestApplicationContext } from "@nestjs/common";

import type { IdentityProvider } from "@fc/identity-provider-adapter-mongo/schemas";
import type { OidcClientService } from "@fc/oidc-client";
import {
  FakeIdentityProvider,
  Fia1IdentityProviderDocument,
} from "@mocks/identity-provider-adapter-mongo";

export const IDP_ISSUER = "https://fake-fia1-test.example";

function signHs256Jwt(
  payload: Record<string, unknown>,
  secret: string,
): string {
  const key = jose.JWK.asKey(Buffer.from(secret, "utf8"), { kty: "oct" });
  return jose.JWT.sign(payload, key, {
    algorithm: "HS256",
    header: { typ: "JWT" },
  });
}

/**
 * A fake external IdP, driven through its real HTTP protocol shape
 * (`jest.spyOn(oidcClient, "fetch")`) instead of overriding
 * `OidcClientService` - the real `authorizationCodeGrant()`/
 * `fetchUserInfo()` (openid-client) pipeline runs: real
 * `config[customFetch]` wiring, real JWT signing/parsing, real claims
 * extraction, real TokenDto validation, real EntraID acr mapping.
 *
 * HS256 (keyed by the fixture's own `client_secret`, per OIDC Core
 * 10.1's symmetric-key convention) stands in for the fixture's real
 * ES256 - avoids needing a live `/jwks` endpoint or asymmetric keys,
 * while still exercising a genuinely signed, genuinely verified JWT.
 *
 * @example
 * const idp = FakeIdp.create().withFields({ endSessionURL: "..." });
 * await idp.seed(app);
 * const idToken = idp.authenticate(oidcClient, { userinfo });
 */
export class FakeIdp {
  private fields: Partial<IdentityProvider> = {};

  private constructor(
    private readonly idpFixture: Partial<IdentityProvider>,
  ) {}

  static create(
    idpFixture: Partial<IdentityProvider> = Fia1IdentityProviderDocument,
  ): FakeIdp {
    return new FakeIdp(idpFixture);
  }

  withFields(fields: Partial<IdentityProvider>): this {
    Object.assign(this.fields, fields);
    return this;
  }

  seed(app: INestApplicationContext): Promise<IdentityProvider> {
    return FakeIdentityProvider.create(this.idpFixture)
      .withFields({
        authzURL: `${IDP_ISSUER}/authorize`,
        discovery: false,
        id_token_signed_response_alg: "HS256",
        jwksURL: `${IDP_ISSUER}/jwks`,
        tokenURL: `${IDP_ISSUER}/token`,
        url: IDP_ISSUER,
        userinfo_signed_response_alg: "",
        userInfoURL: `${IDP_ISSUER}/userinfo`,
        ...this.fields,
      })
      .seed(app);
  }

  /**
   * Mocks only the transport (`config[customFetch]`), not the service -
   * `getToken()`/`getUserinfo()` run for real against these fake
   * responses. Returns the signed `id_token` for callers that need to
   * assert on it directly.
   */
  authenticate(
    oidcClient: OidcClientService,
    {
      idTokenClaims = {},
      userinfo,
    }: { idTokenClaims?: Record<string, unknown>; userinfo: object },
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const idToken = signHs256Jwt(
      {
        iss: IDP_ISSUER,
        sub: (userinfo as { sub: string }).sub,
        aud: this.idpFixture.clientID,
        exp: now + 3600,
        iat: now,
        nonce: "test-nonce",
        acr: "eidas1",
        amr: ["pwd"],
        ...idTokenClaims,
      },
      this.idpFixture.client_secret,
    );

    jest
      .spyOn(oidcClient, "fetch")
      .mockImplementation(async (_useHyyyperbridge, url) => {
        const target = String(url);
        if (target.endsWith("/token")) {
          return new Response(
            JSON.stringify({
              access_token: "test-access-token",
              id_token: idToken,
              token_type: "Bearer",
              expires_in: 3600,
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        if (target.endsWith("/userinfo")) {
          return new Response(JSON.stringify(userinfo), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        throw new Error(`unexpected fetch to ${target}`);
      });

    return idToken;
  }
}
