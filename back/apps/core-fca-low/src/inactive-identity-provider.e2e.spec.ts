import { MongoClient } from "mongodb";

import { LoggerService, TrackedEvent } from "#libs/logger";
import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";

import { identityProviders } from "../../../scripts/seed/data/identity-providers";
import { serviceProviders } from "../../../scripts/seed/data/service-providers";
import { TestingBench } from "./test-bench";

const serviceProvider = {
  ...serviceProviders.mock_sp1,
  introspection_signed_response_alg: "ES256",
};

// mock_idp1, mock_idp2 and mock_pci (the default idp) are attached to polyfi.fr,
// FIA3-LOW is the only idp attached to fia3.fr
const activeIdp = identityProviders.mock_idp1;
const inactiveIdp = { ...identityProviders.mock_idp2, active: false };
const defaultIdp = identityProviders.mock_pci;
const inactiveIdpAloneOnItsDomain = identityProviders["FIA3-LOW"];

const getCsrfToken = (html: string) =>
  html.match(/name="csrfToken"\s+value="([^"]+)"/)[1];

const authorizeParams = {
  acr_values: "eidas1",
  client_id: serviceProvider.key,
  nonce: "nonce-of-at-least-32-characters-long",
  redirect_uri: serviceProvider.redirect_uris[0],
  response_type: "code",
  scope: "openid email",
  state: "state-of-at-least-32-characters-long",
};

describe("Inactive identity providers", () => {
  let bench: TestingBench;
  let agent: ReturnType<TestingBench["agent"]>;

  beforeAll(async () => {
    bench = await TestingBench.createTestBench();

    const client = await MongoClient.connect(bench.mongo.getUri());
    await client
      .db()
      .collection("client")
      .insertOne({ ...serviceProvider });
    await client
      .db()
      .collection("provider")
      .insertMany([
        { ...activeIdp },
        { ...inactiveIdp },
        { ...defaultIdp },
        { ...inactiveIdpAloneOnItsDomain },
      ]);
    await client.close();
    await bench.app.get(ServiceProviderAdapterMongoService).refreshCache();
  }, 30_000);

  afterAll(async () => {
    await bench?.[Symbol.asyncDispose]();
  });

  beforeEach(() => {
    agent = bench.agent();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const getInteractionPage = async (extraParams = {}) => {
    const authorizeResponse = await agent
      .get("/api/v2/authorize")
      .query({ ...authorizeParams, ...extraParams });
    expect(authorizeResponse.status).toBe(303);

    return agent.get(authorizeResponse.headers.location);
  };

  describe("GET /interaction/:uid with an idp_hint", () => {
    it.each`
      case          | idpHint                            | isIdpDisabledTracked
      ${"unknown"}  | ${"unknown-idp"}                   | ${false}
      ${"inactive"} | ${inactiveIdpAloneOnItsDomain.uid} | ${true}
    `(
      "should answer invalid_request to the service provider for an $case idp_hint",
      async ({ idpHint, isIdpDisabledTracked }) => {
        const track = jest.spyOn(bench.app.get(LoggerService), "track");

        const interactionResponse = await getInteractionPage({
          idp_hint: idpHint,
        });
        // oidc-provider resumes the aborted interaction on /authorize/:uid
        expect(interactionResponse.status).toBe(303);
        const resumeResponse = await agent.get(
          interactionResponse.headers.location,
        );

        expect(resumeResponse.status).toBe(303);
        const spRedirection = new URL(resumeResponse.headers.location);
        expect(spRedirection.origin + spRedirection.pathname).toBe(
          serviceProvider.redirect_uris[0],
        );
        expect(Object.fromEntries(spRedirection.searchParams)).toMatchObject({
          error: "invalid_request",
          error_description:
            "The specified idp_hint does not match any registered and active identity provider.",
          state: authorizeParams.state,
        });
        if (isIdpDisabledTracked) {
          expect(track).toHaveBeenCalledWith(TrackedEvent.FC_IDP_DISABLED);
        } else {
          expect(track).not.toHaveBeenCalledWith(TrackedEvent.FC_IDP_DISABLED);
        }
      },
    );
  });

  describe("email routing to an inactive identity provider", () => {
    const submitEmail = async (email: string) => {
      const interactionPage = await getInteractionPage();
      expect(interactionPage.status).toBe(200);

      return agent
        .post("/api/v2/redirect-to-idp")
        .type("form")
        .send({ email, csrfToken: getCsrfToken(interactionPage.text) });
    };

    const expectIdpDisabledErrorPage = (errorPage: {
      status: number;
      text: string;
    }) => {
      expect(errorPage.status).toBe(400);
      expect(errorPage.text).toContain("Accès indisponible");
      expect(errorPage.text).toContain("Y020017");
    };

    it("should block the user, instead of falling back to the default identity provider, when the identity provider of the email domain is inactive", async () => {
      const errorPage = await submitEmail("jean@fia3.fr");

      expectIdpDisabledErrorPage(errorPage);

      // the "Réessayer de vous connecter" button sends the error to the service provider
      const [, retryUrl] = errorPage.text.match(
        /href="([^"]+)"[^>]*>\s*Réessayer de vous connecter/,
      );
      const errorResponse = await agent.get(retryUrl.replaceAll("&amp;", "&"));
      expect(errorResponse.status).toBe(303);
      const resumeResponse = await agent.get(errorResponse.headers.location);
      expect(resumeResponse.status).toBe(303);
      const spRedirection = new URL(resumeResponse.headers.location);
      expect(spRedirection.origin + spRedirection.pathname).toBe(
        serviceProvider.redirect_uris[0],
      );
      expect(spRedirection.searchParams.get("error")).toBe("server_error");
    });

    it("should offer an inactive identity provider along the others, and block the user who picks it", async () => {
      const redirectResponse = await submitEmail("jean@polyfi.fr");
      expect(redirectResponse.status).toBe(302);
      const selectionPage = await agent.get(redirectResponse.headers.location);

      expect(selectionPage.status).toBe(200);
      const offeredIdpUids = [
        ...selectionPage.text.matchAll(
          /name="identityProviderUid" value="([^"]+)"/g,
        ),
      ].map(([, uid]) => uid);
      expect(offeredIdpUids).toIncludeSameMembers([
        activeIdp.uid,
        inactiveIdp.uid,
        defaultIdp.uid,
      ]);

      const errorPage = await agent
        .post("/api/v2/identity-provider-selection")
        .type("form")
        .send({
          identityProviderUid: inactiveIdp.uid,
          csrfToken: getCsrfToken(selectionPage.text),
        });

      expectIdpDisabledErrorPage(errorPage);
    });
  });
});
