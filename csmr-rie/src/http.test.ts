import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { connect, type AddressInfo } from "node:net";
import { describe, it } from "node:test";
import { createRoutes } from "./http.ts";

describe("/livez", () => {
  it("is alive even when the broker is down", async () => {
    await using server = createServer(
      createRoutes({ isConnected: () => false }),
    ).listen(0);
    await once(server, "listening");
    const { port } = server.address() as AddressInfo;

    const res = await fetch(`http://127.0.0.1:${port}/livez`);

    assert.equal(res.status, 200);
    assert.equal(await res.text(), "ok");
  });
});

describe("/readyz", () => {
  it("is ready when the broker is connected", async () => {
    await using server = createServer(
      createRoutes({ isConnected: () => true }),
    ).listen(0);
    await once(server, "listening");
    const { port } = server.address() as AddressInfo;

    const res = await fetch(`http://127.0.0.1:${port}/readyz`);

    assert.equal(res.status, 200);
    assert.equal(await res.text(), "ok");
  });

  it("is unavailable when the broker is disconnected", async () => {
    await using server = createServer(
      createRoutes({ isConnected: () => false }),
    ).listen(0);
    await once(server, "listening");
    const { port } = server.address() as AddressInfo;

    const res = await fetch(`http://127.0.0.1:${port}/readyz`);

    assert.equal(res.status, 503);
    assert.equal(await res.text(), "error");
  });

  it("explains success when verbose", async () => {
    await using server = createServer(
      createRoutes({ isConnected: () => true }),
    ).listen(0);
    await once(server, "listening");
    const { port } = server.address() as AddressInfo;

    const res = await fetch(`http://127.0.0.1:${port}/readyz?verbose`);

    assert.equal(res.status, 200);
    assert.equal(await res.text(), "[+]broker ok\nreadyz check passed");
  });

  it("explains failure when verbose", async () => {
    await using server = createServer(
      createRoutes({ isConnected: () => false }),
    ).listen(0);
    await once(server, "listening");
    const { port } = server.address() as AddressInfo;

    const res = await fetch(`http://127.0.0.1:${port}/readyz?verbose`);

    assert.equal(res.status, 503);
    assert.equal(
      await res.text(),
      "[-]broker failed (disconnected)\nreadyz check failed",
    );
  });
});

describe("malformed request", () => {
  it("is rejected without crashing", async () => {
    await using server = createServer(
      createRoutes({ isConnected: () => true }),
    ).listen(0);
    await once(server, "listening");
    const { port } = server.address() as AddressInfo;

    const socket = connect(port, "127.0.0.1");
    socket.end("GET //[ HTTP/1.1\r\nHost: _\r\n\r\n");
    let response = "";
    for await (const chunk of socket) response += chunk;

    assert.match(response, /^HTTP\/1\.1 404 /);
  });
});
