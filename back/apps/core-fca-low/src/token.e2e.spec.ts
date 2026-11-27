import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TestingBench } from "#testing";

describe("POST /token", () => {
  for (const { expected, given } of [
    {
      expected: { acr: "eidas1" },
      given: {
        claims: '{"id_token":{"acr":{"essential":true,"value":"eidas1"}}}',
      },
    },
    {
      expected: { acr: "eidas2" },
      given: {
        claims: '{"id_token":{"acr":{"essential":true,"value":"eidas2"}}}',
      },
    },
    {
      expected: { acr: "eidas3" },
      given: {
        claims: '{"id_token":{"acr":{"essential":true,"value":"eidas3"}}}',
      },
    },
    { expected: { acr: "eidas1" }, given: { acr_values: "eidas1" } },
    { expected: { acr: "eidas1" }, given: { acr_values: "inconnu" } },
    { expected: { acr: "eidas2" }, given: { acr_values: "eidas2 eidas3" } },
    { expected: { acr: "eidas3" }, given: { acr_values: "inconnu eidas3" } },
    {
      expected: { acr: "eidas3" },
      given: { acr_values: "eidas1", idpAcr: "eidas3" },
    },
    {
      expected: { acr: "eidas1" },
      given: { acr_values: "eidas1", idpAcr: "inconnu" },
    },
    {
      expected: { acr: "eidas1" },
      given: { claims: '{"id_token":{"acr":{"essential":true}}}' },
    },
    {
      expected: { acr: "eidas1-mfa" },
      given: {
        claims:
          '{"id_token":{"acr":{"essential":true,"values":["eidas0-mfa","eidas1-mfa","eidas2","eidas3"]}}}',
        email: "test@fia2.fr",
        idpAcr: "eidas1-mfa",
      },
    },
  ]) {
    it(`should issue an id_token with acr ${expected.acr} when the service provider sends ${given.acr_values ? `acr_values ${given.acr_values}` : `claims ${given.claims}`} and the identity provider grants ${given.idpAcr ?? "the requested acr"}`, async () => {
      await using bench = await TestingBench.createTestBench();

      const signIn = await bench.serviceProviders
        .mock_sp2({ acr_values: given.acr_values, claims: given.claims })
        .signIn({ acr: given.idpAcr, email: given.email });
      assert.equal(signIn.kind, "signed-in");
      const { token } = signIn;

      assert.deepStrictEqual(
        {
          acr: JSON.parse(
            Buffer.from(
              token.body.id_token.split(".")[1],
              "base64url",
            ).toString(),
          ).acr,
          status: token.status,
        },
        { acr: expected.acr, status: 200 },
      );
    });
  }
});
