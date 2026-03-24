import "reflect-metadata";

import { Test, TestingModule } from "@nestjs/testing";

import { ConfigService } from "@fc/config";
import { LoggerService } from "@fc/logger";
import { IDENTITY_PROVIDER_SERVICE } from "@fc/oidc-client/tokens";

import { getLoggerMock } from "@mocks/logger";

import * as classTransformer from "class-transformer";
import * as classValidator from "class-validator";
import * as openidClient from "openid-client";

import { getConfigMock } from "@mocks/config";
import {
  AuthorizationResponseErrorException,
  OidcClientIdpDisabledException,
  OidcClientIdpNotFoundException,
  OidcClientIssuerDiscoveryFailedException,
  OidcClientTokenFailedException,
  OidcClientTokenValidationFailedException,
  OidcClientUserinfoFailedException,
} from "../exceptions";
import { OidcClientService } from "./oidc-client.service";

jest.mock("openid-client");
jest.mock("class-validator", () => ({
  ...jest.requireActual("class-validator"),
  validate: jest.fn(),
}));
jest.mock("class-transformer", () => ({
  ...jest.requireActual("class-transformer"),
  plainToInstance: jest.fn(),
}));

describe("OidcClientService", () => {
  let service: OidcClientService;

  const configServiceMock = getConfigMock();
  const loggerMock = getLoggerMock();

  const identityProviderMock = {
    getById: jest.fn(),
  };

  const idpMock = {
    active: true,
    discovery: true,
    discoveryUrl: "https://idp.test",
    federationClientMetadata: {
      client_id: "client-id",
      client_secret: "client-secret",
      id_token_signed_response_alg: "RS256",
      userinfo_signed_response_alg: "RS256",
    },
    supportEmail: "support@test.com",
    name: "IDP Name",
    title: "IDP Title",
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcClientService,
        ConfigService,
        LoggerService,
        { provide: IDENTITY_PROVIDER_SERVICE, useValue: identityProviderMock },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    service = module.get<OidcClientService>(OidcClientService);
    configServiceMock.get.mockReturnValue({ timeout: 6000 });
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("objToUrlParams", () => {
    it("should filter null/undefined/empty values and stringify objects", () => {
      // Given
      const obj = { a: 1, b: null, c: { d: 2 }, e: "", f: undefined };

      // When
      const result = OidcClientService.objToUrlParams(obj);

      // Then
      expect(result.get("a")).toBe("1");
      expect(result.has("b")).toBe(false);
      expect(result.get("c")).toBe('{"d":2}');
      expect(result.has("e")).toBe(false);
      expect(result.has("f")).toBe(false);
    });
  });

  describe("getCurrentUrl", () => {
    it("should construct URL from request", () => {
      // Given
      const req = {
        protocol: "https",
        get: () => "example.com",
        originalUrl: "/path",
      };

      // When
      const result = OidcClientService.getCurrentUrl(req);

      // Then
      expect(result.href).toBe("https://example.com/path");
    });
  });

  describe("getProviderConfig", () => {
    beforeEach(() => {
      (openidClient.ClientSecretPost as jest.Mock).mockReturnValue(jest.fn());
    });

    it("should throw OidcClientIdpNotFoundException if IDP not found", async () => {
      // Given
      identityProviderMock.getById.mockResolvedValue(null);

      // When / Then
      await expect(service.getProviderConfig("idp-id")).rejects.toThrow(
        OidcClientIdpNotFoundException,
      );
    });

    it("should throw OidcClientIdpDisabledException if IDP not active", async () => {
      // Given
      identityProviderMock.getById.mockResolvedValue({
        ...idpMock,
        active: false,
      });

      // When / Then
      await expect(service.getProviderConfig("idp-id")).rejects.toThrow(
        OidcClientIdpDisabledException,
      );
    });

    it("should call configuration contructor if discovery not enabled", async () => {
      // Given
      const idpWithoutDiscovery = {
        ...idpMock,
        discovery: false,
      };
      const configMock = { some: "config" };
      identityProviderMock.getById.mockResolvedValue(idpWithoutDiscovery);
      (openidClient.Configuration as jest.Mock).mockReturnValue(configMock);

      // When
      const result = await service.getProviderConfig("idp-id");

      // Then
      expect(result).toEqual({ config: configMock, idp: idpWithoutDiscovery });
    });

    it("should throw OidcClientIssuerDiscoveryFailedException on discovery failure", async () => {
      // Given
      identityProviderMock.getById.mockResolvedValue(idpMock);
      (openidClient.discovery as jest.Mock).mockRejectedValue(
        new Error("discovery failed"),
      );

      // When / Then
      await expect(service.getProviderConfig("idp-id")).rejects.toThrow(
        OidcClientIssuerDiscoveryFailedException,
      );
    });

    it("should return config and idp on success", async () => {
      // Given
      const configMock = { some: "config" };
      identityProviderMock.getById.mockResolvedValue(idpMock);
      (openidClient.discovery as jest.Mock).mockResolvedValue(configMock);

      // When
      const result = await service.getProviderConfig("idp-id");

      // Then
      expect(result).toEqual({ config: configMock, idp: idpMock });
    });

    it("should handle null userinfo_signed_response_alg", async () => {
      // Given
      const idpWithoutUserinfoAlg = {
        ...idpMock,
        federationClientMetadata: {
          ...idpMock.federationClientMetadata,
          userinfo_signed_response_alg: undefined,
        },
      };
      identityProviderMock.getById.mockResolvedValue(idpWithoutUserinfoAlg);
      (openidClient.discovery as jest.Mock).mockResolvedValue({});

      // When
      await service.getProviderConfig("idp-id");

      // Then
      expect(openidClient.discovery).toHaveBeenCalledWith(
        expect.any(URL),
        expect.any(String),
        expect.objectContaining({
          userinfo_signed_response_alg: undefined,
        }),
        expect.any(Function), // ClientSecretPost returns a function
        expect.any(Object),
      );
    });
  });

  describe("getAuthorizationUrl", () => {
    beforeEach(() => {
      identityProviderMock.getById.mockResolvedValue(idpMock);
      (openidClient.discovery as jest.Mock).mockResolvedValue({});
      (openidClient.randomNonce as jest.Mock).mockReturnValue("test-nonce");
      (openidClient.randomState as jest.Mock).mockReturnValue("test-state");
      (openidClient.buildAuthorizationUrl as jest.Mock).mockReturnValue(
        new URL("https://auth.test"),
      );
      configServiceMock.get.mockReturnValue({
        redirectUri: "https://rp.test/cb",
      });
    });

    it("should return authorization URL with nonce and state", async () => {
      // When
      const result = await service.getAuthorizationUrl("idp-id", {});

      // Then
      expect(result).toEqual({
        authorizationUrl: "https://auth.test/",
        nonce: "test-nonce",
        state: "test-state",
        idpName: idpMock.name,
        idpLabel: idpMock.title,
      });
    });

    it("should add is_service_public scope for default IDP", async () => {
      // Given
      configServiceMock.get.mockImplementation((key) =>
        key === "OidcClient"
          ? { redirectUri: "https://rp.test/cb" }
          : { defaultIdpId: "idp-id" },
      );

      // When
      await service.getAuthorizationUrl("idp-id", {});

      // Then
      expect(openidClient.buildAuthorizationUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          toString: expect.any(Function),
        }),
      );
    });

    it("should handle EntraID specific scope and remove claims", async () => {
      // Given
      identityProviderMock.getById.mockResolvedValue({
        ...idpMock,
        isEntraID: true,
      });

      // When
      await service.getAuthorizationUrl("idp-id", {
        claims: { test: "value" },
      });

      // Then
      expect(openidClient.buildAuthorizationUrl).toHaveBeenCalled();
    });

    it("should merge custom params with default params", async () => {
      // When
      await service.getAuthorizationUrl("idp-id", { acr_values: "eidas3" });

      // Then
      expect(openidClient.buildAuthorizationUrl).toHaveBeenCalled();
    });
  });

  describe("getToken", () => {
    const reqMock = {
      protocol: "https",
      get: () => "rp.test",
      originalUrl: "/callback",
    };

    const tokensMock = {
      claims: jest.fn().mockReturnValue({ sub: "user-sub" }),
      access_token: "access-token",
      id_token: "id-token",
    };

    beforeEach(() => {
      identityProviderMock.getById.mockResolvedValue(idpMock);
      (openidClient.discovery as jest.Mock).mockResolvedValue({});
      (classValidator.validate as jest.Mock).mockResolvedValue([]);
      (classTransformer.plainToInstance as jest.Mock).mockImplementation(
        (_, obj) => {
          // Ensure claims property is present
          return { ...obj, claims: obj.claims || {} };
        },
      );
    });

    it("should throw AuthorizationResponseErrorException on authorization error", async () => {
      // Given
      const params = new URLSearchParams({
        error: "invalid_request",
        error_description: "Invalid state",
      });
      const authError = new openidClient.AuthorizationResponseError(
        "Authorization error",
        { cause: params },
      );
      (openidClient.authorizationCodeGrant as jest.Mock).mockRejectedValue(
        authError,
      );

      // When / Then
      await expect(
        service.getToken({
          idpId: "idp-id",
          req: reqMock as any,
          idpState: "state",
          idpNonce: "nonce",
        }),
      ).rejects.toThrow(AuthorizationResponseErrorException);
    });

    it("should throw OidcClientTokenFailedException on other errors", async () => {
      // Given
      (openidClient.authorizationCodeGrant as jest.Mock).mockRejectedValue(
        new Error("Token error"),
      );

      // When / Then
      await expect(
        service.getToken({
          idpId: "idp-id",
          req: reqMock as any,
          idpState: "state",
          idpNonce: "nonce",
        }),
      ).rejects.toThrow(OidcClientTokenFailedException);
    });

    it("should throw OidcClientTokenValidationFailedException on validation errors", async () => {
      // Given
      (openidClient.authorizationCodeGrant as jest.Mock).mockResolvedValue(
        tokensMock,
      );
      (classValidator.validate as jest.Mock).mockResolvedValue([
        { error: "validation error" },
      ]);

      // When / Then
      await expect(
        service.getToken({
          idpId: "idp-id",
          req: reqMock as any,
          idpState: "state",
          idpNonce: "nonce",
        }),
      ).rejects.toThrow(OidcClientTokenValidationFailedException);
    });

    it("should return token with default acr eidas1", async () => {
      // Given
      (openidClient.authorizationCodeGrant as jest.Mock).mockResolvedValue(
        tokensMock,
      );

      // When
      const result = await service.getToken({
        idpId: "idp-id",
        req: reqMock as any,
        idpState: "state",
        idpNonce: "nonce",
      });

      // Then
      expect(result.claims.acr).toBe("eidas1");
      expect(result.accessToken).toBe("access-token");
      expect(result.idToken).toBe("id-token");
    });

    it("should use acr from claims if present", async () => {
      // Given
      const tokensWithAcr = {
        ...tokensMock,
        claims: jest.fn().mockReturnValue({ sub: "user-sub", acr: "eidas3" }),
      };
      (openidClient.authorizationCodeGrant as jest.Mock).mockResolvedValue(
        tokensWithAcr,
      );

      // When
      const result = await service.getToken({
        idpId: "idp-id",
        req: reqMock as any,
        idpState: "state",
        idpNonce: "nonce",
      });

      // Then
      expect(result.claims.acr).toBe("eidas3");
    });

    it("should map EntraID acrs to eidas levels", async () => {
      // Given
      identityProviderMock.getById.mockResolvedValue({
        ...idpMock,
        isEntraID: true,
      });
      const tokensWithAcrs = {
        ...tokensMock,
        claims: jest
          .fn()
          .mockReturnValue({ sub: "user-sub", acrs: ["c2", "other"] }),
      };
      (openidClient.authorizationCodeGrant as jest.Mock).mockResolvedValue(
        tokensWithAcrs,
      );

      // When
      const result = await service.getToken({
        idpId: "idp-id",
        req: reqMock as any,
        idpState: "state",
        idpNonce: "nonce",
      });

      // Then
      expect(result.claims.acr).toBe("eidas2");
    });

    it("should filter acrs for EntraID keeping only c-prefixed values", async () => {
      // Given
      identityProviderMock.getById.mockResolvedValue({
        ...idpMock,
        isEntraID: true,
      });
      const tokensWithMultipleAcrs = {
        ...tokensMock,
        claims: jest.fn().mockReturnValue({
          sub: "user-sub",
          acrs: ["c3", "other-value", "something-else"],
        }),
      };
      (openidClient.authorizationCodeGrant as jest.Mock).mockResolvedValue(
        tokensWithMultipleAcrs,
      );

      // When
      const result = await service.getToken({
        idpId: "idp-id",
        req: reqMock as any,
        idpState: "state",
        idpNonce: "nonce",
      });

      // Then
      expect(result.claims.acr).toBe("eidas3");
    });

    it("should log token claims", async () => {
      // Given
      const freshTokensMock = {
        claims: jest.fn().mockReturnValue({ sub: "user-sub" }),
        access_token: "access-token",
        id_token: "id-token",
      };
      (openidClient.authorizationCodeGrant as jest.Mock).mockResolvedValue(
        freshTokensMock,
      );

      // When
      await service.getToken({
        idpId: "idp-id",
        req: reqMock as any,
        idpState: "state",
        idpNonce: "nonce",
      });

      // Then
      expect(loggerMock.info).toHaveBeenCalledWith({
        code: "oidc-client-info:get-token",
        claims: expect.objectContaining({ sub: "user-sub" }),
      });
    });
  });

  describe("getUserinfo", () => {
    const claimsMock = { sub: "user-sub", email: "user@test.com" } as any;

    beforeEach(() => {
      identityProviderMock.getById.mockResolvedValue(idpMock);
      (openidClient.discovery as jest.Mock).mockResolvedValue({});
    });

    it("should throw OidcClientUserinfoFailedException on error", async () => {
      // Given
      (openidClient.fetchUserInfo as jest.Mock).mockRejectedValue(
        new Error("Userinfo error"),
      );

      // When / Then
      await expect(
        service.getUserinfo({
          idpId: "idp-id",
          accessToken: "access-token",
          claims: claimsMock,
        }),
      ).rejects.toThrow(OidcClientUserinfoFailedException);
    });

    it("should return userinfo and log it", async () => {
      // Given
      const userinfoMock = { sub: "user-sub", email: "user@test.com" };
      (openidClient.fetchUserInfo as jest.Mock).mockResolvedValue(userinfoMock);

      // When
      const result = await service.getUserinfo({
        idpId: "idp-id",
        accessToken: "access-token",
        claims: claimsMock,
      });

      // Then
      expect(result).toEqual(userinfoMock);
      expect(loggerMock.info).toHaveBeenCalledWith({
        code: "oidc-client-info:get-userinfo",
        plainIdpIdentity: userinfoMock,
      });
    });

    it("should merge claims from ID token for EntraID when missing in userinfo", async () => {
      // Given
      identityProviderMock.getById.mockResolvedValue({
        ...idpMock,
        isEntraID: true,
      });
      const userinfoMock = { sub: "user-sub" };
      (openidClient.fetchUserInfo as jest.Mock).mockResolvedValue(userinfoMock);

      // When
      const result = await service.getUserinfo({
        idpId: "idp-id",
        accessToken: "access-token",
        claims: claimsMock,
      });

      // Then
      expect(result.email).toBe("user@test.com");
    });

    it("should not override existing userinfo values for EntraID", async () => {
      // Given
      identityProviderMock.getById.mockResolvedValue({
        ...idpMock,
        isEntraID: true,
      });
      const userinfoMock = { sub: "user-sub", email: "existing@test.com" };
      (openidClient.fetchUserInfo as jest.Mock).mockResolvedValue(userinfoMock);

      // When
      const result = await service.getUserinfo({
        idpId: "idp-id",
        accessToken: "access-token",
        claims: claimsMock,
      });

      // Then
      expect(result.email).toBe("existing@test.com");
    });
  });

  describe("getEndSessionUrl", () => {
    beforeEach(() => {
      identityProviderMock.getById.mockResolvedValue(idpMock);
      (openidClient.discovery as jest.Mock).mockResolvedValue({});
      configServiceMock.get.mockReturnValue({
        postLogoutRedirectUri: "https://rp.test/logout",
      });
    });

    it("should return null and log warning on error", async () => {
      // Given
      (openidClient.buildEndSessionUrl as jest.Mock).mockImplementation(() => {
        throw new Error("End session error");
      });

      // When
      const result = await service.getEndSessionUrl({
        idpId: "idp-id",
        idTokenHint: "id-token-hint",
      });

      // Then
      expect(result).toBeNull();
      expect(loggerMock.warn).toHaveBeenCalledWith({
        code: "get-end-session-url-failed",
        originalError: expect.any(Error),
      });
    });

    it("should return end session URL without client_id parameter", async () => {
      // Given
      (openidClient.buildEndSessionUrl as jest.Mock).mockReturnValue(
        new URL("https://logout.test?other=param&client_id=client-id"),
      );

      // When
      const result = await service.getEndSessionUrl({
        idpId: "idp-id",
        idTokenHint: "id-token-hint",
      });

      // Then
      expect(result).toBe("https://logout.test/?other=param");
      expect(result).not.toContain("client_id");
    });

    it("should handle URL with client_id as first parameter", async () => {
      // Given
      (openidClient.buildEndSessionUrl as jest.Mock).mockReturnValue(
        new URL("https://logout.test?client_id=client-id"),
      );

      // When
      const result = await service.getEndSessionUrl({
        idpId: "idp-id",
        idTokenHint: "id-token-hint",
      });

      // Then
      expect(result).toBe("https://logout.test/");
    });

    it("should work without idTokenHint", async () => {
      // Given
      (openidClient.buildEndSessionUrl as jest.Mock).mockReturnValue(
        new URL(
          "https://logout.test?post_logout_redirect_uri=https://rp.test/logout",
        ),
      );

      // When
      const result = await service.getEndSessionUrl({ idpId: "idp-id" });

      // Then
      expect(result).toBeTruthy();
    });
  });
});
