import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TestingBench } from "#testing";

describe("GET /", () => {
  it("should redirect permanently to the default redirect uri when the root is requested", async () => {
    await using bench = await TestingBench.createTestBench();

    const response = await bench.request.get("/");

    assert.deepStrictEqual(
      { location: response.headers.location, status: response.status },
      { location: "https://www.proconnect.gouv.fr", status: 301 },
    );
  });
});
