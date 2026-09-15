import request from "supertest";

import { TestingBench } from "../test-bench";

describe("InteractionController", () => {
  describe("GET /", () => {
    it("should redirect to the configured defaultRedirectUri", async () => {
      await using bench = await TestingBench.createTestBench();
      const { app } = bench;

      await request(app.getHttpServer())
        .get("/")
        .expect(301)
        .expect("Location", "https://www.proconnect.gouv.fr");
    });
  });
});
