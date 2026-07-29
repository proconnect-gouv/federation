import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createCipheriv, randomBytes } from "node:crypto";
import request from "supertest";
import { createApp, type EnvConfig } from "./app.ts";

function encrypt(plaintext: string, cipherPass: string): string {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", cipherPass, nonce);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([nonce, cipher.getAuthTag(), ciphertext]).toString(
    "base64",
  );
}

const CIPHER_PASS = "0123456789abcdef0123456789abcdef";

const config: EnvConfig = {
  FQDN: "localhost",
  PORT: 3000,
  STYLESHEET_URL: "https://example.com/style.css",
  IdentityProviderAdapterEnv_CLIENT_ID: "test-client-id",
  IdentityProviderAdapterEnv_CLIENT_SECRET: encrypt(
    "test-client-secret",
    CIPHER_PASS,
  ),
  IdentityProviderAdapterEnv_CLIENT_SECRET_CIPHER_PASS: CIPHER_PASS,
  IdentityProviderAdapterEnv_DISCOVERY_URL:
    "https://example.com/.well-known/openid-configuration",
  App_DATA_APIS: [],
  ACR_VALUES_FOR_2FA: "eidas1",
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

  it("GET / renders the test harness page", async () => {
    const res = await request(app).get("/");
    assert.equal(res.status, 200);
    assert.match(res.text, /example\.com\/style\.css/);
  });
});
