import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { serviceProviders } from "#seed/service-providers";
import { TestingBench } from "#testing";

describe("GET /interaction/:uid/error", () => {
  for (const { error, error_description, query } of [
    {
      error: "access_denied",
      error_description: "nope",
      query: { error: "access_denied", error_description: "nope" },
    },
    {
      error: "server_error",
      error_description: "An unexpected error occurred",
      query: {},
    },
  ]) {
    it(`should send ${error} "${error_description}" to the service provider when the query is ${JSON.stringify(query)}`, async () => {
      await using bench = await TestingBench.createTestBench();
      const { response: authorize, session } = await bench.serviceProviders
        .mock_sp1()
        .authorize();
      const uid = authorize.headers.location.split("/").at(-1);

      await session.agent.get(`/interaction/${uid}/error`).query(query);
      const response = await session.agent.get(`/authorize/${uid}`);

      const location = new URL(response.headers.location);
      assert.deepStrictEqual(
        {
          callback: `${location.origin}${location.pathname}`,
          query: Object.fromEntries(location.searchParams),
          status: response.status,
        },
        {
          callback: serviceProviders.mock_sp1.redirect_uris[0],
          query: {
            error,
            error_description,
            iss: "https://core-fca-low.docker.dev-franceconnect.fr/api/v2",
            state: session.query.state,
          },
          status: 303,
        },
      );
    });
  }
});
