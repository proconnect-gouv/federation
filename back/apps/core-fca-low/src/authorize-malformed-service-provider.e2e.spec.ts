import { MongoClient } from "mongodb";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";

import { serviceProviders } from "#seed/service-providers";
import { TestingBench } from "#testing";

describe("GET /authorize", () => {
  const { key, redirect_uris } = serviceProviders.mock_sp1;
  const query = {
    acr_values: "eidas1",
    client_id: key,
    nonce: "nonce-of-at-least-32-characters-long",
    redirect_uri: redirect_uris[0],
    response_type: "code",
    scope: "openid email",
    state: "state-of-at-least-32-characters-long",
  };

  it("should redirect to the interaction when the service provider document is complete", async () => {
    await using bench = await TestingBench.createTestBench();

    const response = await bench.request.get("/authorize").query(query);

    assert.equal(response.status, 303);
  });

  it("should answer 400 when the service provider document lacks isXdaEnabled", async () => {
    await using bench = await TestingBench.createTestBench();
    const client = await MongoClient.connect(bench.mongo.getUri());
    await client
      .db()
      .collection("client")
      .updateOne({ key }, { $unset: { isXdaEnabled: "" } });
    await client.close();
    await bench.app.get(ServiceProviderAdapterMongoService).refreshCache();

    const response = await bench.request.get("/authorize").query(query);

    assert.deepStrictEqual(
      {
        error: /client configuration is invalid: \w+/.exec(response.text)?.[0],
        status: response.status,
      },
      { error: "client configuration is invalid: isXdaEnabled", status: 400 },
    );
  });
});
