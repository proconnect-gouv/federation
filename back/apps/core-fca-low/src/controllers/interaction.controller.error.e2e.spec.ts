import request from "supertest";

import { OidcProviderService } from "@fc/oidc-provider";

import { TestingBench } from "../test-bench";

const INTERACTION_UID = "1234567890-1234567890";

describe("GET /interaction/:uid/error", () => {
  it("should call abortInteraction with the error query params", async () => {
    await using bench = await TestingBench.createTestBench();
    const { app } = bench;

    // OidcProviderService is used app-wide (middleware registration on
    // boot), so it can't be swapped via overrideProvider - spy on the
    // real, already-booted instance instead. Real interactionFinished()
    // needs full provider-internal state beyond route-level smoke scope.
    const abortInteraction = jest
      .spyOn(app.get(OidcProviderService), "abortInteraction")
      .mockImplementation(async (_req, res) => {
        res.redirect(302, "https://stub.example/aborted");
      });

    await request(app.getHttpServer())
      .get(
        `/interaction/${INTERACTION_UID}/error?error=access_denied&error_description=nope`,
      )
      .expect(302)
      .expect("Location", "https://stub.example/aborted");

    expect(abortInteraction).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { error: "access_denied", error_description: "nope" },
    );
  });

  it("should default error and error_description when no query params are given", async () => {
    await using bench = await TestingBench.createTestBench();
    const { app } = bench;

    const abortInteraction = jest
      .spyOn(app.get(OidcProviderService), "abortInteraction")
      .mockImplementation(async (_req, res) => {
        res.redirect(302, "https://stub.example/aborted");
      });

    await request(app.getHttpServer())
      .get(`/interaction/${INTERACTION_UID}/error`)
      .expect(302)
      .expect("Location", "https://stub.example/aborted");

    expect(abortInteraction).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      {
        error: "server_error",
        error_description: "An unexpected error occurred",
      },
    );
  });
});
