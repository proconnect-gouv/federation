import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { identityProviders } from "#seed/identity-providers";
import { serviceProviders } from "#seed/service-providers";
import { TestingBench } from "#testing";

describe("GET /interaction/:uid", () => {
  it("should render the identity provider choice when the service provider sends no hint", async () => {
    await using bench = await TestingBench.createTestBench();
    const { response: authorize, session } = await bench.serviceProviders
      .mock_sp1()
      .authorize();
    const uid = authorize.headers.location.split("/").at(-1);

    const response = await session.agent.get(`/interaction/${uid}`);

    assert.deepStrictEqual(
      {
        contentType: response.headers["content-type"],
        spName: /<span class="fr-h4">([^<]*)<\/span>/.exec(response.text)?.[1],
        status: response.status,
        title: /<title>([^<]*)<\/title>/.exec(response.text)?.[1],
      },
      {
        contentType: "text/html; charset=utf-8",
        spName: "FSA - FSA1-LOW",
        status: 200,
        title: "Choix du compte - ProConnect",
      },
    );
  });

  it("should send the idp_hint_not_found error to the service provider when idp_hint is unknown", async () => {
    await using bench = await TestingBench.createTestBench();
    const { response: authorize, session } = await bench.serviceProviders
      .mock_sp1({ idp_hint: "unknown-identity-provider" })
      .authorize();
    const uid = authorize.headers.location.split("/").at(-1);

    await session.agent.get(`/interaction/${uid}`);
    const response = await session.agent.get(`/authorize/${uid}`);

    const location = new URL(response.headers.location);
    assert.deepStrictEqual(
      {
        callback: `${location.origin}${location.pathname}`,
        query: Object.fromEntries(location.searchParams),
        status: response.status,
      },
      {
        callback: serviceProviders.mock_sp1.redirect_uris[0],
        query: {
          error: "idp_hint_not_found",
          error_description: "provided idp_hint could not be found",
          iss: "https://core-fca-low.docker.dev-franceconnect.fr/api/v2",
          state: session.query.state,
        },
        status: 303,
      },
    );
  });

  it("should redirect to the hinted identity provider when idp_hint names an active one", async () => {
    await using bench = await TestingBench.createTestBench();
    const { clientID, uid: idpId } = identityProviders.mock_idp1;
    const { response: authorize, session } = await bench.serviceProviders
      .mock_sp1({ idp_hint: idpId })
      .authorize();
    const uid = authorize.headers.location.split("/").at(-1);

    const response = await session.agent.get(`/interaction/${uid}`);

    const location = new URL(response.headers.location);
    assert.deepStrictEqual(
      {
        authorizationEndpoint: `${location.origin}${location.pathname}`,
        clientId: location.searchParams.get("client_id"),
        status: response.status,
      },
      {
        authorizationEndpoint:
          "https://fia1-low.docker.dev-franceconnect.fr/authorize",
        clientId: clientID,
        status: 302,
      },
    );
  });

  it("should redirect to the identity provider selection when login_hint's domain is attached to several identity providers", async () => {
    await using bench = await TestingBench.createTestBench();
    const { response: authorize, session } = await bench.serviceProviders
      .mock_sp1({ login_hint: "jean@polyfi.fr" })
      .authorize();
    const uid = authorize.headers.location.split("/").at(-1);

    const response = await session.agent.get(`/interaction/${uid}`);

    assert.deepStrictEqual(
      { location: response.headers.location, status: response.status },
      { location: "/api/v2/identity-provider-selection", status: 302 },
    );
  });
});
