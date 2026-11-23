import { TestingBench } from "./test-bench";

describe("TestingBench", () => {
  it("should boot a real app against an in-memory Mongo replset and tear it down cleanly", async () => {
    await using bench = await TestingBench.createTestBench();

    expect(bench.app).toBeDefined();
  });

  it("should apply a configureModule override before compiling", async () => {
    let called = false;
    await using bench = await TestingBench.createTestBench((builder) => {
      called = true;
      return builder;
    });

    expect(called).toBe(true);
    expect(bench.app).toBeDefined();
  });

  it("should serve the app under its urlPrefix through a cookie-keeping agent", async () => {
    await using bench = await TestingBench.createTestBench();

    const response = await bench.agent().get("/api/v2/livez");
    const absoluteResponse = await bench
      .agent()
      .get(`${bench.url}/api/v2/livez`);

    expect(response.status).toBe(200);
    expect(absoluteResponse.status).toBe(200);
  });
});
