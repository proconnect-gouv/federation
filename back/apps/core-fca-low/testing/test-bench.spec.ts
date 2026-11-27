import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TestingBench } from "#testing";

describe("TestingBench", () => {
  it("should boot a real app against an in-memory Mongo replset and tear it down cleanly", async () => {
    await using bench = await TestingBench.createTestBench();

    assert.ok(bench.app);
  });

  it("should apply a configureModule override before compiling", async () => {
    let called = false;
    await using bench = await TestingBench.createTestBench((builder) => {
      called = true;
      return builder;
    });

    assert.deepStrictEqual(
      { app: Boolean(bench.app), called },
      { app: true, called: true },
    );
  });
});
