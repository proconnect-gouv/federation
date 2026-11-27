import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TestingBench } from "#testing";
import TEST_CONFIG from "../../.mocks/config";
import { buildOpenidConfiguration } from "./openid-configuration";

// Guards against drift between the static maintenance discovery document and
// the one served by `oidc-provider` (new scope, claim, acr…).
describe("GET /.well-known/openid-configuration", () => {
  it("should match the static maintenance discovery document", async () => {
    const { issuer } = TEST_CONFIG.OidcProvider;
    await using bench = await TestingBench.createTestBench();

    const { text } = await bench.request.get(
      "/.well-known/openid-configuration",
    );
    // The test bench serves endpoints on its ephemeral local origin.
    const served = JSON.parse(text.replace(/http:\/\/[^/"]+/g, issuer));

    assert.deepStrictEqual(served, buildOpenidConfiguration(issuer));
  });
});
