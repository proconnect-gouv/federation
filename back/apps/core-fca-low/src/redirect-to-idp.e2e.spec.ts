import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { identityProviders } from "#seed/identity-providers";
import { TestingBench } from "#testing";

describe("POST /redirect-to-idp", () => {
  for (const { expected, given } of [
    {
      expected: { acr: null },
      given: {
        email: "test@fia2.fr",
        values: ["eidas0-mfa", "eidas1-mfa", "eidas2", "eidas3"],
      },
    },
    {
      expected: { acr: { essential: true, values: ["eidas0", "eidas0-mfa"] } },
      given: {
        email: "test+mfa@fia2.fr",
        values: ["eidas0", "eidas0-mfa"],
      },
    },
  ]) {
    it(`should ask the non MFA-compliant identity provider for acr ${JSON.stringify(expected.acr)} when ${given.email} signs in to a service provider requiring acr ${given.values.join(" ")}`, async () => {
      await using bench = await TestingBench.createTestBench();

      const { redirectToIdp } = await bench.serviceProviders
        .mock_sp2({
          claims: JSON.stringify({
            id_token: { acr: { essential: true, values: given.values } },
          }),
        })
        .signIn({ email: given.email });

      const location = new URL(redirectToIdp.headers.location);
      assert.deepStrictEqual(
        {
          acr: JSON.parse(location.searchParams.get("claims")).id_token.acr,
          acr_values: location.searchParams.get("acr_values"),
          identity_provider: `${location.origin}/`,
          status: redirectToIdp.status,
        },
        {
          acr: expected.acr,
          acr_values: null,
          identity_provider: identityProviders.mock_idp2.url,
          status: 302,
        },
      );
    });
  }
});
