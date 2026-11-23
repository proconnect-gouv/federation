import { generateKeyPairSync } from "crypto";
import request from "supertest";
import TEST_CONFIG from "../../.mocks/config";
import { TestingBench } from "../test-bench";
import { buildOpenidConfiguration } from "./openid-configuration";

// Guards against drift between the static maintenance discovery document and
// the one served by `oidc-provider` (new scope, claim, acr…).
describe("maintenance openid-configuration", () => {
  it("matches the discovery document served by oidc-provider", async () => {
    const { issuer, jwks } = TEST_CONFIG.OidcProvider;
    // Production signs with both ES256 and RS256 keys, tests only with ES256.
    const rs256Key = {
      ...generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey.export({
        format: "jwk",
      }),
      alg: "RS256",
      use: "sig",
      kid: "rs256-test",
    };
    await using bench = await TestingBench.createTestBench(undefined, {
      OidcProvider: {
        ...TEST_CONFIG.OidcProvider,
        jwks: { keys: [...jwks.keys, rs256Key] },
      },
    });

    const { text } = await request(bench.app.getHttpServer()).get(
      "/.well-known/openid-configuration",
    );
    // The test bench serves endpoints on its ephemeral local origin.
    const served = JSON.parse(text.replace(/http:\/\/[^/"]+/g, issuer));

    expect(served).toEqual(buildOpenidConfiguration(issuer));
  }, 30_000);
});
