import request from "supertest";

import {
  createServiceProvider,
  Fsa1ServiceProviderDocument,
} from "@mocks/service-provider-adapter-mongo";

import { signOidcProviderCookie } from "../../.mocks/oidc-provider-cookie";
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

  describe("GET /interaction/:uid", () => {
    const interaction = {
      uid: "1234567890-1234567890",
      params: {
        client_id: Fsa1ServiceProviderDocument.key,
        state: "test-state",
        scope: "openid email",
      },
      prompt: {
        name: "login",
        reasons: [],
      },
    };

    it("should render the interaction page", async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      await redis.set(
        "OIDC-P:Interaction:1234567890-1234567890",
        JSON.stringify(interaction),
      );

      await request(app.getHttpServer())
        .get("/interaction/1234567890-1234567890")
        .set(
          "Cookie",
          signOidcProviderCookie("_interaction", "1234567890-1234567890"),
        )
        .expect(200)
        .expect("Content-Type", "text/html; charset=utf-8")
        .expect(({ text }) => {
          expect(text).toContain("Choix du compte - ProConnect");
          expect(text).toContain("Se connecter ou s'inscrire");
          expect(text).toContain(Fsa1ServiceProviderDocument.name);
        });
    });
  });
});
