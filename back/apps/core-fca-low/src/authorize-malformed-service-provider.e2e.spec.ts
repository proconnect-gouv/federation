import { MongoClient } from "mongodb";
import request from "supertest";

import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";

import { TestingBench } from "./test-bench";

const serviceProvider = {
  active: true,
  client_secret:
    "+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=",
  id_token_signed_response_alg: "HS256",
  introspection_signed_response_alg: "HS256",
  isXdaEnabled: true,
  key: "my-service-provider",
  name: "FSA - my-service-provider",
  post_logout_redirect_uris: ["https://fsa1-low.docker.dev-franceconnect.fr/"],
  redirect_uris: ["https://fsa1-low.docker.dev-franceconnect.fr/oidc-callback"],
  scopes: ["openid", "email"],
  type: "public",
  userinfo_signed_response_alg: null,
};
const { isXdaEnabled: _, ...serviceProviderWithoutIsXdaEnabled } =
  serviceProvider;

describe("GET /api/v2/authorize with a service provider document from mongo", () => {
  it.each`
    case                      | document                              | status | isInvalidClient
    ${"without isXdaEnabled"} | ${serviceProviderWithoutIsXdaEnabled} | ${400} | ${true}
    ${"with isXdaEnabled"}    | ${serviceProvider}                    | ${303} | ${false}
  `(
    "should answer $status (invalid_client=$isInvalidClient) for a document $case",
    async ({ document, isInvalidClient, status }) => {
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
      expect(response.text.includes("client is invalid")).toBe(isInvalidClient);
    },
  );
});
