import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TestingBench } from "#testing";

describe("GET /interaction/:uid/verify", () => {
  it("should restart the interaction when the session lacks the identity provider login", async () => {
    await using bench = await TestingBench.createTestBench();
    const { response: authorize, session } = await bench.serviceProviders
      .mock_sp1()
      .authorize();
    const uid = authorize.headers.location.split("/").at(-1);

    const response = await session.agent.get(`/interaction/${uid}/verify`);

    assert.deepStrictEqual(
      { location: response.headers.location, status: response.status },
      { location: `/api/v2/interaction/${uid}`, status: 302 },
    );
  });

  it("should render the session not found error page when the browser sends no cookie", async () => {
    await using bench = await TestingBench.createTestBench();

    const response = await bench.request.get(
      "/interaction/unknown-interaction/verify",
    );

    assert.deepStrictEqual(
      {
        code: /code erreur : (\S+)/.exec(response.text)?.[1],
        message: /message erreur : "([^"]*)"/.exec(response.text)?.[1],
        status: response.status,
      },
      {
        code: "oidc-provider-error:session-not-found",
        message: "interaction session id cookie not found",
        status: 400,
      },
    );
  });

  it("should render the internal error page when the stored interaction is unreadable", async () => {
    await using bench = await TestingBench.createTestBench();
    const { response: authorize, session } = await bench.serviceProviders
      .mock_sp1()
      .authorize();
    const uid = authorize.headers.location.split("/").at(-1);
    await bench.redis.set(`OIDC-P:Interaction:${uid}`, "not json");

    const response = await session.agent.get(`/interaction/${uid}/verify`);

    assert.deepStrictEqual(
      {
        code: /code erreur : (\S+)/.exec(response.text)?.[1],
        status: response.status,
      },
      { code: "Y000500", status: 500 },
    );
  });
});
