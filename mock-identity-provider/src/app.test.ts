import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import type { EnvConfig } from "./config.ts";

const { createApp } = await import("./app.ts");

const config: EnvConfig = {
  FQDN: "localhost",
  PORT: 3000,
  STYLESHEET_URL: "https://example.com/style.css",
  ServiceProviderAdapterEnv_CLIENT_ID: "test-client-id",
  ServiceProviderAdapterEnv_CLIENT_SECRET: "test-client-secret",
  ServiceProviderAdapterEnv_REDIRECT_URIS: ["https://example.com/callback"],
  ServiceProviderAdapterEnv_POST_LOGOUT_REDIRECT_URIS: [
    "https://example.com/logout-callback",
  ],
  ServiceProviderAdapterEnv_SCOPE: "openid email",
  ServiceProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG: "ES256",
  ServiceProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG: "ES256",
};

const { app } = createApp(config);

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

  it("openid-configuration returns provider metadata with correct issuer", async () => {
    const res = await request(app).get("/.well-known/openid-configuration");
    assert.equal(res.status, 200);
    assert.equal(res.body.issuer, "https://localhost");
  });

  it("POST /interaction/:uid/login with unknown uid fails gracefully", async () => {
    const res = await request(app)
      .post("/interaction/unknown-uid/login")
      .type("form")
      .send({ email: "test@example.com", acr: "eidas1", amr: "pwd" });
    assert.ok(res.status >= 400, `expected ≥400, got ${res.status}`);
  });
});
