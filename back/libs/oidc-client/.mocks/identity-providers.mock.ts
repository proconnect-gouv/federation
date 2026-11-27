import * as jose from "jose";
import { randomUUID } from "node:crypto";

interface MockedIdentityProvider {
  clientID: string;
  id_token_signed_response_alg: string;
  url: string;
  userinfo_signed_response_alg: string;
}

interface Login {
  claims: { idToken: object; userinfo: object };
  idp: MockedIdentityProvider;
  nonce: string;
}

export class IdentityProvidersMock {
  readonly #keys = new Map<string, jose.JWK.Key>();
  readonly #logins = new Map<string, Login>();

  constructor(private readonly identityProviders: MockedIdentityProvider[]) {}

  fetch = async (
    _useTheHyyyperbridge: boolean,
    input: string | URL | Request,
    options: RequestInit = {},
  ): Promise<Response> => {
    const url = new URL(input instanceof Request ? input.url : input);
    const idp = this.#find(url);
    const endpoint = (name: string) => `${idp.url.replace(/\/$/, "")}/${name}`;
    const json = (body: object) =>
      new Response(JSON.stringify(body), {
        headers: { "content-type": "application/json" },
      });

    switch (url.pathname.split("/").pop()) {
      case "openid-configuration":
        return json({
          authorization_endpoint: endpoint("authorize"),
          id_token_signing_alg_values_supported: [
            idp.id_token_signed_response_alg,
          ],
          issuer: idp.url,
          jwks_uri: endpoint("jwks"),
          token_endpoint: endpoint("token"),
          userinfo_endpoint: endpoint("userinfo"),
          userinfo_signing_alg_values_supported: [
            idp.userinfo_signed_response_alg,
          ].filter(Boolean),
        });
      case "jwks":
        return json({
          keys: [
            ...new Set([
              idp.id_token_signed_response_alg,
              idp.userinfo_signed_response_alg,
            ]),
          ]
            .filter(Boolean)
            .map((alg) => this.#key(idp, alg).toJWK()),
        });
      case "token": {
        const code = new URLSearchParams(String(options.body)).get("code");
        const { claims, nonce } = this.#login(code);
        return json({
          access_token: code,
          expires_in: 3600,
          id_token: this.#sign(idp, idp.id_token_signed_response_alg, {
            ...claims.idToken,
            nonce,
          }),
          token_type: "Bearer",
        });
      }
      case "userinfo": {
        const code = new Headers(options.headers)
          .get("authorization")
          .replace(/^Bearer /i, "");
        const { claims } = this.#login(code);
        if (!idp.userinfo_signed_response_alg) return json(claims.userinfo);
        return new Response(
          this.#sign(idp, idp.userinfo_signed_response_alg, claims.userinfo),
          { headers: { "content-type": "application/jwt" } },
        );
      }
    }
    throw new Error(`unexpected identity provider call: ${url}`);
  };

  login(authorizationUrl: string, claims: Login["claims"]) {
    const url = new URL(authorizationUrl);
    const { acr } = JSON.parse(url.searchParams.get("claims") ?? "{}")
      .id_token ?? { acr: undefined };
    const code = randomUUID();
    this.#logins.set(code, {
      claims: {
        ...claims,
        idToken: {
          acr:
            acr?.value ||
            acr?.values?.[0] ||
            url.searchParams.get("acr_values")?.split(" ")[0] ||
            "eidas1",
          ...claims.idToken,
        },
      },
      idp: this.#find(url),
      nonce: url.searchParams.get("nonce"),
    });
    return { code, state: url.searchParams.get("state") };
  }

  #find(url: URL) {
    const idp = this.identityProviders.find(
      (candidate) => new URL(candidate.url).origin === url.origin,
    );
    if (!idp) throw new Error(`unknown identity provider: ${url}`);
    return idp;
  }

  #key(idp: MockedIdentityProvider, alg: string) {
    const id = `${idp.url} ${alg}`;
    if (!this.#keys.has(id))
      this.#keys.set(
        id,
        alg === "ES256"
          ? jose.JWK.generateSync("EC", "P-256", { alg, use: "sig" })
          : jose.JWK.generateSync("RSA", 2048, { alg, use: "sig" }),
      );
    return this.#keys.get(id);
  }

  #login(code: string) {
    const login = this.#logins.get(code);
    if (!login) throw new Error(`unknown identity provider code: ${code}`);
    return login;
  }

  #sign(idp: MockedIdentityProvider, alg: string, claims: object) {
    return jose.JWT.sign(
      { aud: idp.clientID, iat: Math.floor(Date.now() / 1000), ...claims },
      this.#key(idp, alg),
      { algorithm: alg, expiresIn: "1h", issuer: idp.url },
    );
  }
}
