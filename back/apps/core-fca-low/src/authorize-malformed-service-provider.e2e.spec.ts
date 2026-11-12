import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";
import { MongoClient } from "mongodb";

import { serviceProviders } from "../../../scripts/seed/data/service-providers";
import { TestingBench } from "./test-bench";

const serviceProvider = {
  ...serviceProviders.mock_sp1,
  introspection_signed_response_alg: "ES256",
};
const { isXdaEnabled: _, ...serviceProviderWithoutIsXdaEnabled } =
  serviceProvider;

describe("GET /api/v2/authorize with a service provider document from mongo", () => {
  let bench: TestingBench;
  let mongo: MongoClient;

  beforeAll(async () => {
    bench = await TestingBench.createTestBench();
    mongo = await MongoClient.connect(bench.mongo.getUri());
  }, 30_000);

  afterAll(async () => {
    await mongo?.close();
    await bench?.[Symbol.asyncDispose]();
  });

  afterEach(async () => {
    await mongo.db().collection("client").deleteMany({});
  });

  it.each`
    case                      | document                              | status | errorDescription
    ${"without isXdaEnabled"} | ${serviceProviderWithoutIsXdaEnabled} | ${400} | ${"client configuration is invalid: isXdaEnabled"}
    ${"with isXdaEnabled"}    | ${serviceProvider}                    | ${303} | ${undefined}
  `(
    "should answer $status for a document $case",
    async ({ document, errorDescription, status }) => {
      await mongo
        .db()
        .collection("client")
        .insertOne({ ...document });
      await bench.app.get(ServiceProviderAdapterMongoService).refreshCache();

      const response = await bench.agent().get("/api/v2/authorize").query({
        acr_values: "eidas1",
        client_id: serviceProvider.key,
        nonce: "nonce-of-at-least-32-characters-long",
        redirect_uri: serviceProvider.redirect_uris[0],
        response_type: "code",
        scope: "openid email",
        state: "state-of-at-least-32-characters-long",
      });

      expect(response.status).toBe(status);
      if (errorDescription) expect(response.text).toContain(errorDescription);
    },
  );
});
