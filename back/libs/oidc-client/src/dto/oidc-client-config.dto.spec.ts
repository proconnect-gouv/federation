import { validateDto } from "#libs/common";
import { OidcClientConfig } from "./oidc-client-config.dto";

describe("OidcClientConfig", () => {
  const config = {
    enableHyyyperbridge: false,
    postLogoutRedirectUri:
      "https://core-fca-low.docker.dev-franceconnect.fr/api/v2/client/logout-callback",
    redirectUri:
      "https://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback",
    timeout: 6000,
  };
  const http = {
    ...config,
    postLogoutRedirectUri:
      "http://core-fca-low.docker.dev-franceconnect.fr/api/v2/client/logout-callback",
    redirectUri:
      "http://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback",
  };

  it("accepts https URLs", async () => {
    expect(await validateDto(config, OidcClientConfig, {})).toEqual([]);
  });

  it("rejects http by default", async () => {
    const errors = await validateDto(http, OidcClientConfig, {});
    expect(errors.map(({ property }) => property)).toEqual([
      "redirectUri",
      "postLogoutRedirectUri",
    ]);
  });

  it("accepts http when isHttpAllowed", async () => {
    expect(
      await validateDto({ ...http, isHttpAllowed: true }, OidcClientConfig, {}),
    ).toEqual([]);
  });

  it("rejects other protocols even when isHttpAllowed", async () => {
    const errors = await validateDto(
      {
        ...http,
        isHttpAllowed: true,
        redirectUri:
          "ftp://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback",
      },
      OidcClientConfig,
      {},
    );
    expect(errors.map(({ property }) => property)).toEqual(["redirectUri"]);
  });
});
