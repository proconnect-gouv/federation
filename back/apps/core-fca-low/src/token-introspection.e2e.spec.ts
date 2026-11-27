import { MongoClient } from "mongodb";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";

import { OidcProviderService } from "#libs/oidc-provider";
import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";

import { resourceServers } from "#seed/resource-servers";
import { serviceProviders } from "#seed/service-providers";
import { TestingBench } from "./test-bench";

describe("POST /token/introspection", () => {
  it("should let api-partenaires introspect an access token issued to a service provider", async () => {
    const serviceProvider = {
      ...serviceProviders.mock_sp1,
      introspection_signed_response_alg: "ES256",
    };
    const apiPartenaires = resourceServers["api-partenaires"];
    await using bench = await TestingBench.createTestBench();
    const client = await MongoClient.connect(bench.mongo.getUri());
    await client
      .db()
      .collection("client")
      .insertMany([serviceProvider, apiPartenaires]);
    await client.close();
    await bench.app.get(ServiceProviderAdapterMongoService).refreshCache();
    const provider = bench.app.get(OidcProviderService).getProvider();
    const grant = new provider.Grant({
      accountId: "agent-with-a-live-token",
      clientId: serviceProvider.key,
    });
    grant.addOIDCScope("openid email");
    const accessToken = await new provider.AccessToken({
      accountId: "agent-with-a-live-token",
      client: await provider.Client.find(serviceProvider.key),
      grantId: await grant.save(),
      gty: "authorization_code",
      scope: "openid email",
    }).save();

    const response = await request(bench.app.getHttpServer())
      .post("/token/introspection")
      .type("form")
      .set("Accept", "application/json")
      .send({
        client_id: apiPartenaires.key,
        client_secret:
          "36aa214e7a0043c8da60ae991d8908947147d637137c5bf14bc2fc53e1055847",
        token: accessToken,
      });

    // supertest parses the body only for a JSON answer, not for a JWT one.
    const { active, client_id, scope, sub, token_type } = response.body;
    assert.deepStrictEqual(
      { active, client_id, scope, status: response.status, sub, token_type },
      {
        active: true,
        client_id: serviceProvider.key,
        scope: "openid email",
        status: 200,
        sub: "agent-with-a-live-token",
        token_type: "Bearer",
      },
    );
  });
});
