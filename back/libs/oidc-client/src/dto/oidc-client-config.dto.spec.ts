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
  const localhost = {
    ...config,
    postLogoutRedirectUri:
      "https://localhost:3443/api/v2/client/logout-callback",
    redirectUri: "https://localhost:3443/api/v2/oidc-callback",
  };

  it("accepts https URLs with a TLD", async () => {
    expect(await validateDto(config, OidcClientConfig, {})).toEqual([]);
  });

  it("rejects localhost by default", async () => {
    const errors = await validateDto(localhost, OidcClientConfig, {});
    expect(errors.map(({ property }) => property)).toEqual([
      "redirectUri",
      "postLogoutRedirectUri",
    ]);
  });

  it("accepts localhost when isLocalhostAllowed", async () => {
    expect(
      await validateDto(
        { ...localhost, isLocalhostAllowed: true },
        OidcClientConfig,
        {},
      ),
    ).toEqual([]);
  });

  it("rejects http even when isLocalhostAllowed", async () => {
    const errors = await validateDto(
      {
        ...localhost,
        isLocalhostAllowed: true,
        redirectUri: "http://localhost:3443/api/v2/oidc-callback",
      },
      OidcClientConfig,
      {},
    );
    expect(errors.map(({ property }) => property)).toEqual(["redirectUri"]);
  });
});
