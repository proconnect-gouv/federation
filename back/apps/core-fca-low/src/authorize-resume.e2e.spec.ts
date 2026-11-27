import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { serviceProviders } from "#seed/service-providers";
import { TestingBench } from "#testing";

describe("GET /authorize/:id", () => {
  it("should restart the interaction when acr_values eidas3 stays unsatisfied next to an essential acr claim eidas2", async () => {
    await using bench = await TestingBench.createTestBench();

    const { kind, resume } = await bench.serviceProviders
      .mock_sp2({
        acr_values: "eidas3",
        claims: '{"id_token":{"acr":{"essential":true,"value":"eidas2"}}}',
      })
      .signIn();

    assert.deepStrictEqual(
      {
        kind,
        location: resume.headers.location.replace(/[^/]+$/, ":uid"),
        status: resume.status,
      },
      { kind: "stopped", location: "/api/v2/interaction/:uid", status: 303 },
    );
  });

  for (const { expected, given } of [
    {
      expected: {
        error: "access_denied",
        error_description: "requested ACRs could not be satisfied",
        kind: "stopped",
        redirect_uri: serviceProviders.mock_sp2.redirect_uris[0],
        status: 303,
      },
      given: { acr: "eidas1", idpAcr: "eidas2" },
    },
    {
      expected: {
        error: "access_denied",
        error_description: "requested ACRs could not be satisfied",
        kind: "stopped",
        redirect_uri: serviceProviders.mock_sp2.redirect_uris[0],
        status: 303,
      },
      given: { acr: "eidas2", idpAcr: "eidas1" },
    },
  ]) {
    it(`should redirect to the service provider with ${expected.error} when it requires acr ${given.acr} and the identity provider grants ${given.idpAcr}`, async () => {
      await using bench = await TestingBench.createTestBench();

      const { kind, resume } = await bench.serviceProviders
        .mock_sp2({
          claims: `{"id_token":{"acr":{"essential":true,"value":"${given.acr}"}}}`,
        })
        .signIn({ acr: given.idpAcr });

      const location = new URL(resume.headers.location);
      assert.deepStrictEqual(
        {
          error: location.searchParams.get("error"),
          error_description: location.searchParams.get("error_description"),
          kind,
          redirect_uri: `${location.origin}${location.pathname}`,
          status: resume.status,
        },
        expected,
      );
    });
  }
});
