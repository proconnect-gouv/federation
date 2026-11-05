import { MongoClient } from "mongodb";
import request from "supertest";

import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";

import { serviceProviders } from "../../../scripts/seed/data/service-providers";
import { TestingBench } from "./test-bench";

const serviceProvider = {
  ...serviceProviders.mock_sp1,
  introspection_signed_response_alg: "ES256",
};
const { isXdaEnabled: _, ...serviceProviderWithoutIsXdaEnabled } =
  serviceProvider;

describe("GET /api/v2/authorize with a service provider document from mongo", () => {
  it.each`
    case                      | document                              | status | errorDescription
    ${"without isXdaEnabled"} | ${serviceProviderWithoutIsXdaEnabled} | ${400} | ${"client configuration is invalid: isXdaEnabled"}
    ${"with isXdaEnabled"}    | ${serviceProvider}                    | ${303} | ${undefined}
  `(
    "should answer $status for a document $case",
    async ({ document, errorDescription, status }) => {
      await using bench = await TestingBench.createTestBench();
      const client = await MongoClient.connect(bench.mongo.getUri());
      await client.db().collection("client").insertOne(document);
      await client.close();
      await bench.app.get(ServiceProviderAdapterMongoService).refreshCache();

      const response = await request(bench.app.getHttpServer())
        .get("/authorize")
        .query({
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
