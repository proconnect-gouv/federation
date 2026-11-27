import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  resourceServers,
  resourceServersClientSecret,
} from "#seed/resource-servers";
import { serviceProviders } from "#seed/service-providers";
import { TestingBench } from "#testing";

describe("POST /token/introspection", () => {
  it("should let api-partenaires introspect an access token issued to a service provider", async () => {
    await using bench = await TestingBench.createTestBench();
    const { session } = await bench.serviceProviders.mock_sp2().authorize();
    const signIn = await session.signIn();
    assert.equal(signIn.kind, "signed-in");
    const { token } = signIn;

    const response = await bench.request
      .post("/token/introspection")
      .type("form")
      .set("Accept", "application/json")
      .send({
        client_id: resourceServers["api-partenaires"].key,
        client_secret: resourceServersClientSecret,
        token: token.body.access_token,
      });

    // supertest parses the body only for a JSON answer, not for a JWT one.
    const { active, client_id, scope, sub, token_type } = response.body;
    const idToken = JSON.parse(
      Buffer.from(token.body.id_token.split(".")[1], "base64url").toString(),
    );
    assert.deepStrictEqual(
      { active, client_id, scope, status: response.status, sub, token_type },
      {
        active: true,
        client_id: serviceProviders.mock_sp2.key,
        scope: "openid email given_name usual_name",
        status: 200,
        sub: idToken.sub,
        token_type: "Bearer",
      },
    );
  });

  it("should answer a signed introspection JWT when the resource server accepts one", async () => {
    await using bench = await TestingBench.createTestBench();

    const response = await bench.request
      .post("/token/introspection")
      .type("form")
      .set("Accept", "application/token-introspection+jwt")
      .send({
        client_id: resourceServers["DPA1-LOW"].key,
        client_secret: resourceServersClientSecret,
        token: "unknown-token",
      });

    const [header, payload] = response.text
      .split(".", 2)
      .map((part) => JSON.parse(Buffer.from(part, "base64url").toString()));
    assert.deepStrictEqual(
      {
        alg: header.alg,
        claims: Object.keys(payload).sort(),
        contentType: response.headers["content-type"],
        setCookie: response.headers["set-cookie"],
        status: response.status,
      },
      {
        alg: "ES256",
        claims: ["aud", "iat", "iss", "token_introspection"],
        contentType: "application/token-introspection+jwt; charset=utf-8",
        setCookie: undefined,
        status: 200,
      },
    );
  });

  const client_id = resourceServers["DPA1-LOW"].key;
  const client_secret = resourceServersClientSecret;
  for (const { body, error, error_description, situation, status } of [
    {
      body: { client_secret, token: "unknown-token" },
      error: "invalid_request",
      error_description: "no client authentication mechanism provided",
      situation: "client_id is missing",
      status: 400,
    },
    {
      body: { client_id, token: "unknown-token" },
      error: "invalid_client",
      error_description: "client authentication failed",
      situation: "client_secret is missing",
      status: 401,
    },
    {
      body: { client_id, client_secret },
      error: "invalid_request",
      error_description: "missing required parameter 'token'",
      situation: "token is missing",
      status: 400,
    },
    {
      body: {
        client_id,
        client_secret: "invalid-client-secret",
        token: "unknown-token",
      },
      error: "invalid_client",
      error_description: "client authentication failed",
      situation: "client_secret is wrong",
      status: 401,
    },
    {
      body: {
        client_id: "unknown-client-id",
        client_secret,
        token: "unknown-token",
      },
      error: "invalid_client",
      error_description: "client authentication failed",
      situation: "client_id is unknown",
      status: 401,
    },
  ]) {
    it(`should answer ${status} ${error} when the ${situation}`, async () => {
      await using bench = await TestingBench.createTestBench();

      const response = await bench.request
        .post("/token/introspection")
        .type("form")
        .send(body);

      assert.deepStrictEqual(
        {
          body: response.body,
          contentType: response.headers["content-type"],
          setCookie: response.headers["set-cookie"],
          status: response.status,
        },
        {
          body: { error, error_description },
          contentType: "application/json; charset=utf-8",
          setCookie: undefined,
          status,
        },
      );
    });
  }
});
