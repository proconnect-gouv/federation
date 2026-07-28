import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp, type EnvConfig } from "./app.ts";

const config: EnvConfig = {
  DataProviderAdapterCore_CHECKTOKEN_JWT_ENCRYPTED_RESPONSE_ALG: "RSA-OAEP",
  DataProviderAdapterCore_CHECKTOKEN_JWT_ENCRYPTED_RESPONSE_ENC: "A256GCM",
  DataProviderAdapterCore_CHECKTOKEN_JWT_SIGNED_RESPONSE_ALG: "RS256",
  DataProviderAdapterCore_CLIENT_ID: "test-client",
  DataProviderAdapterCore_CLIENT_SECRET: "test-secret",
  DataProviderAdapterCore_ISSUER: "https://issuer.example.com",
  DataProviderAdapterCore_JWKS: [],
  PORT: 3000,
};

const { app } = await createApp(config);

describe("app", () => {
  it("livez returns ok", async () => {
    const res = await request(app).get("/livez");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: "ok" });
  });

  it("readyz returns ok", async () => {
    const res = await request(app).get("/readyz");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: "ok" });
  });

  it("returns empty JWKS before any keys configured", async () => {
    const res = await request(app).get("/api/v1/jwks");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { keys: [] });
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/unknown");
    assert.equal(res.status, 404);
    assert.equal(res.body.status, 404);
    assert.equal(res.body.message, "Not found");
  });

  it("rejects missing Bearer token on /api/v1/data", async () => {
    const res = await request(app).get("/api/v1/data");
    assert.equal(res.status, 500);
  });

  it("rejects invalid Bearer token on /api/v1/data", async () => {
    const res = await request(app)
      .get("/api/v1/data")
      .set("authorization", "Bearer not-base64!!!");
    assert.equal(res.status, 500);
  });
});
