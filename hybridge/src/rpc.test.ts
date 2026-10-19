import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, it } from "node:test";
import { handlePacket } from "./rpc.ts";

describe("HTTP_PROXY", () => {
  it("returns the target response", async () => {
    await using target = createServer((req, res) =>
      res.writeHead(201, { "x-target": "yes" }).end(`${req.method} ${req.url}`),
    ).listen(0);
    await once(target, "listening");
    const { port } = target.address() as AddressInfo;

    const reply = await handlePacket({
      data: {
        headers: {},
        method: "GET",
        url: `http://127.0.0.1:${port}/token`,
      },
      id: "42",
      pattern: "HTTP_PROXY",
    });

    assert.partialDeepStrictEqual(reply, {
      isDisposed: true,
      response: {
        data: {
          data: "GET /token",
          headers: { "x-target": "yes" },
          status: 201,
          statusText: "Created",
        },
        type: "TYPE::DATA",
      },
    });
  });

  it("forwards the request body", async () => {
    await using target = createServer(async (req, res) => {
      let body = "";
      for await (const chunk of req) body += chunk;
      res.end(`${req.method} ${body}`);
    }).listen(0);
    await once(target, "listening");
    const { port } = target.address() as AddressInfo;

    const reply = await handlePacket({
      data: {
        data: "code=abc",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        method: "POST",
        url: `http://127.0.0.1:${port}/token`,
      },
      id: "42",
      pattern: "HTTP_PROXY",
    });

    assert.partialDeepStrictEqual(reply, {
      response: { data: { data: "POST code=abc" } },
    });
  });

  it("reports an unreachable target", async () => {
    const closed = createServer().listen(0);
    await once(closed, "listening");
    const { port } = closed.address() as AddressInfo;
    closed.close();

    const reply = await handlePacket({
      data: { headers: {}, method: "GET", url: `http://127.0.0.1:${port}` },
      id: "42",
      pattern: "HTTP_PROXY",
    });

    assert.partialDeepStrictEqual(reply, {
      response: { data: { code: "ECONNREFUSED" }, type: "TYPE::ERROR" },
    });
  });

  it("rejects an unsupported method", async () => {
    const reply = await handlePacket({
      data: { headers: {}, method: "PUT", url: "https://idp.example.fr" },
      id: "42",
      pattern: "HTTP_PROXY",
    });

    assert.deepEqual(reply, {
      err: { message: "Internal server error", status: "error" },
      isDisposed: true,
    });
  });

  it("rejects an invalid url", async () => {
    const reply = await handlePacket({
      data: { headers: {}, method: "GET", url: "not a url" },
      id: "42",
      pattern: "HTTP_PROXY",
    });

    assert.deepEqual(reply, {
      err: { message: "Internal server error", status: "error" },
      isDisposed: true,
    });
  });

  it("rejects missing headers", async () => {
    const reply = await handlePacket({
      data: { method: "GET", url: "https://idp.example.fr" },
      id: "42",
      pattern: "HTTP_PROXY",
    });

    assert.deepEqual(reply, {
      err: { message: "Internal server error", status: "error" },
      isDisposed: true,
    });
  });
});

describe("ping", () => {
  it("answers pong", async () => {
    const reply = await handlePacket({ id: "42", pattern: "ping" });

    assert.deepEqual(reply, { isDisposed: true, response: "pong" });
  });
});

describe("unknown pattern", () => {
  it("answers with an error", async () => {
    const reply = await handlePacket({ id: "42", pattern: "nope" });

    assert.deepEqual(reply, {
      err: "There is no matching message handler defined in the remote service.",
      id: "42",
      status: "error",
    });
  });

  it("ignores inherited object properties", async () => {
    const reply = await handlePacket({ id: "42", pattern: "constructor" });

    assert.deepEqual(reply, {
      err: "There is no matching message handler defined in the remote service.",
      id: "42",
      status: "error",
    });
  });
});
