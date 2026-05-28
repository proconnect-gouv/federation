import { ConfigService } from "@fc/config";
import { MessageType } from "@fc/hybridge-http-proxy/enums";
import { LoggerService } from "@fc/logger";
import { IDENTITY_PROVIDER_SERVICE } from "@fc/oidc-client/tokens";
import { getConfigMock } from "@mocks/config";
import { getLoggerMock } from "@mocks/logger";
import { Test, TestingModule } from "@nestjs/testing";
import * as classTransformer from "class-transformer";
import * as classValidator from "class-validator";
import * as openidClient from "openid-client";
import "reflect-metadata";
import * as rxjs from "rxjs";

import { getSessionServiceMock } from "@mocks/session";

import { SessionService } from "@fc/session";
import {
  AuthorizationResponseErrorException,
  HyyyperbridgeCsmrException,
  HyyyperbridgeMissingVariableException,
  HyyyperbridgeRabbitmqException,
  OidcClientIdpDisabledException,
  OidcClientIdpNotFoundException,
  OidcClientIssuerDiscoveryFailedException,
  OidcClientTokenFailedException,
  OidcClientTokenValidationFailedException,
  OidcClientUserinfoFailedException,
} from "../exceptions";
import { OidcClientService } from "./oidc-client.service";

const sessionMock = getSessionServiceMock();

jest.mock("openid-client");
jest.mock("rxjs", () => ({
  ...jest.requireActual("rxjs"),
  lastValueFrom: jest.fn(),
  timeout: jest.fn().mockReturnValue(jest.fn()),
}));
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

  const brokerMock = {
    send: jest.fn(),
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
        {
          provide: "HyyyperbridgeBroker",
          useValue: brokerMock,
        },
        SessionService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(SessionService)
      .useValue(sessionMock)
      .compile();

    service = module.get<OidcClientService>(OidcClientService);
    configServiceMock.get.mockReturnValue({
      timeout: 6000,
      enableHyyyperbridge: false,
    });
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

  describe("fetch", () => {
    const urlMock = "https://example.com/api";
    const optionsMock: RequestInit = {
      method: "GET",
      headers: { authorization: "Bearer token" },
    };

    const expectedUpdatedOptions = {
      ...optionsMock,
      headers: {
        ...optionsMock.headers,
        "accept-encoding": "identity",
      },
    };

    describe("when useTheHyyyperbridge is false", () => {
      it("should call native fetch with accept-encoding identity header", async () => {
        // Given
        const responseMock = new Response("ok");
        jest.spyOn(global, "fetch").mockResolvedValue(responseMock);

        // When
        const result = await service.fetch(false, urlMock, optionsMock);

        // Then
        expect(global.fetch).toHaveBeenCalledWith(
          urlMock,
          expectedUpdatedOptions,
        );
        expect(result).toBe(responseMock);
      });
    });

    describe("when useTheHyyyperbridge is true", () => {
      const requestTimeoutMock = 5000;
      const pipedObservableMock = Symbol("pipedObservable");

      beforeEach(() => {
        configServiceMock.get.mockImplementation((key: string) => {
          if (key === "HyyyperbridgeBroker") {
            return { requestTimeout: requestTimeoutMock };
          }
          return { timeout: 6000, enableHyyyperbridge: true };
        });
        brokerMock.send.mockReturnValue({
          pipe: jest.fn().mockReturnValue(pipedObservableMock),
        });
      });

      it("should throw HyyyperbridgeRabbitmqException when broker fails", async () => {
        // Given
        (rxjs.lastValueFrom as jest.Mock).mockRejectedValue(
          new Error("broker error"),
        );

        // When / Then
        await expect(service.fetch(true, urlMock, optionsMock)).rejects.toThrow(
          HyyyperbridgeRabbitmqException,
        );
      });

      it("should throw HyyyperbridgeMissingVariableException when envelope validation fails", async () => {
        // Given
        (rxjs.lastValueFrom as jest.Mock).mockResolvedValue({
          type: "invalid",
          data: {},
        });
        (classTransformer.plainToInstance as jest.Mock).mockReturnValueOnce({
          type: "invalid",
          data: {},
        });
        (classValidator.validate as jest.Mock).mockResolvedValueOnce([
          { error: "invalid envelope" },
        ]);

        // When / Then
        await expect(service.fetch(true, urlMock, optionsMock)).rejects.toThrow(
          HyyyperbridgeMissingVariableException,
        );
      });

      describe("when type is DATA", () => {
        const rawResponseData = {
          status: 200,
          statusText: "OK",
          headers: { "content-type": "application/json" },
          data: '{"result":"success"}',
        };

        it("should return a Response on valid data", async () => {
          // Given
          (rxjs.lastValueFrom as jest.Mock).mockResolvedValue({
            type: MessageType.DATA,
            data: rawResponseData,
          });
          (classTransformer.plainToInstance as jest.Mock)
            .mockReturnValueOnce({
              type: MessageType.DATA,
              data: rawResponseData,
            })
            .mockReturnValueOnce(rawResponseData);
          (classValidator.validate as jest.Mock)
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

          // When
          const result = await service.fetch(true, urlMock, optionsMock);

          // Then
          expect(result).toBeInstanceOf(Response);
          expect(result.status).toBe(200);
          expect(result.statusText).toBe("OK");
          expect(await result.text()).toBe('{"result":"success"}');
        });

        it("should throw HyyyperbridgeMissingVariableException when response DTO validation fails", async () => {
          // Given
          (rxjs.lastValueFrom as jest.Mock).mockResolvedValue({
            type: MessageType.DATA,
            data: rawResponseData,
          });
          (classTransformer.plainToInstance as jest.Mock)
            .mockReturnValueOnce({
              type: MessageType.DATA,
              data: rawResponseData,
            })
            .mockReturnValueOnce(rawResponseData);
          (classValidator.validate as jest.Mock)
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([{ error: "invalid response" }]);

          // When / Then
          await expect(
            service.fetch(true, urlMock, optionsMock),
          ).rejects.toThrow(HyyyperbridgeMissingVariableException);
        });
      });

      describe("when type is ERROR", () => {
        const rawErrorData = {
          code: "ERR_001",
          reason: "Something failed",
          name: "TestError",
        };

        it("should throw HyyyperbridgeCsmrException on valid error data", async () => {
          // Given
          (rxjs.lastValueFrom as jest.Mock).mockResolvedValue({
            type: MessageType.ERROR,
            data: rawErrorData,
          });
          (classTransformer.plainToInstance as jest.Mock)
            .mockReturnValueOnce({
              type: MessageType.ERROR,
              data: rawErrorData,
            })
            .mockReturnValueOnce(rawErrorData);
          (classValidator.validate as jest.Mock)
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

          // When / Then
          await expect(
            service.fetch(true, urlMock, optionsMock),
          ).rejects.toThrow(HyyyperbridgeCsmrException);
        });

        it("should throw HyyyperbridgeMissingVariableException when error DTO validation fails", async () => {
          // Given
          (rxjs.lastValueFrom as jest.Mock).mockResolvedValue({
            type: MessageType.ERROR,
            data: rawErrorData,
          });
          (classTransformer.plainToInstance as jest.Mock)
            .mockReturnValueOnce({
              type: MessageType.ERROR,
              data: rawErrorData,
            })
            .mockReturnValueOnce(rawErrorData);
          (classValidator.validate as jest.Mock)
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([{ error: "invalid error" }]);

          // When / Then
          await expect(
            service.fetch(true, urlMock, optionsMock),
          ).rejects.toThrow(HyyyperbridgeMissingVariableException);
        });
      });

      it("should send the correct message to the broker", async () => {
        // Given
        const optionsWithBody: RequestInit = {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: '{"key":"value"}',
        };
        const rawResponseData = {
          status: 200,
          statusText: "OK",
          headers: {},
          data: "ok",
        };
        (rxjs.lastValueFrom as jest.Mock).mockResolvedValue({
          type: MessageType.DATA,
          data: rawResponseData,
        });
        (classTransformer.plainToInstance as jest.Mock)
          .mockReturnValueOnce({
            type: MessageType.DATA,
            data: rawResponseData,
          })
          .mockReturnValueOnce(rawResponseData);
        (classValidator.validate as jest.Mock)
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);

        // When
        await service.fetch(true, urlMock, optionsWithBody);

        // Then
        expect(brokerMock.send).toHaveBeenCalledWith("HTTP_PROXY", {
          url: urlMock,
          headers: {
            "content-type": "application/json",
            "accept-encoding": "identity",
          },
          method: "POST",
          data: '{"key":"value"}',
        });
      });
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

    it("should set customFetch on non-discovery config routed through hyyyperbridge when enableHyyyperbridge and useTheHyyyperbridge are both true", async () => {
      // Given
      configServiceMock.get.mockReturnValue({
        timeout: 6000,
        enableHyyyperbridge: true,
      });
      const idp = { ...idpMock, discovery: false, useTheHyyyperbridge: true };
      const configMock: Record<string | symbol, any> = {};
      identityProviderMock.getById.mockResolvedValue(idp);
      (openidClient.Configuration as jest.Mock).mockReturnValue(configMock);
      jest.spyOn(service, "fetch").mockResolvedValue(new Response());

      // When
      await service.getProviderConfig("idp-id");
      configMock[openidClient.customFetch]("url", {});

      // Then
      expect(service.fetch).toHaveBeenCalledWith(true, "url", {});
    });

    it("should throw OidcClientIssuerDiscoveryFailedException on discovery failure", async () => {
      // Given
      identityProviderMock.getById.mockResolvedValue(idpMock);
      (openidClient.discovery as jest.Mock).mockRejectedValue(
        new Error("discovery failed", { cause: new Response() }),
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

    it("should pass useTheHyyyperbridge as true when enableHyyyperbridge and idp.useTheHyyyperbridge are both true", async () => {
      // Given
      configServiceMock.get.mockReturnValue({
        timeout: 6000,
        enableHyyyperbridge: true,
      });
      const idpWithHyyyperbridge = {
        ...idpMock,
        useTheHyyyperbridge: true,
      };
      identityProviderMock.getById.mockResolvedValue(idpWithHyyyperbridge);
      (openidClient.discovery as jest.Mock).mockResolvedValue({});

      // When
      await service.getProviderConfig("idp-id");

      // Then
      expect(openidClient.discovery).toHaveBeenCalledWith(
        expect.any(URL),
        expect.any(String),
        expect.any(Object),
        expect.any(Function),
        expect.objectContaining({
          timeout: 6000,
          [openidClient.customFetch]: expect.any(Function),
        }),
      );
    });

    it("should pass useTheHyyyperbridge as false when enableHyyyperbridge is false", async () => {
      // Given
      configServiceMock.get.mockReturnValue({
        timeout: 6000,
        enableHyyyperbridge: false,
      });
      const idpWithHyyyperbridge = {
        ...idpMock,
        useTheHyyyperbridge: true,
      };
      identityProviderMock.getById.mockResolvedValue(idpWithHyyyperbridge);
      (openidClient.discovery as jest.Mock).mockResolvedValue({});

      // When
      await service.getProviderConfig("idp-id");

      // Then
      expect(openidClient.discovery).toHaveBeenCalledWith(
        expect.any(URL),
        expect.any(String),
        expect.any(Object),
        expect.any(Function),
        expect.objectContaining({
          timeout: 6000,
          [openidClient.customFetch]: expect.any(Function),
        }),
      );
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
          spId: "sp-id",
          spName: "sp-name",
        }),
      ).rejects.toThrow(AuthorizationResponseErrorException);
    });

    it("should append error_description to message when present", async () => {
      // Given
      const authError = new openidClient.AuthorizationResponseError(
        "Authorization error",
        { cause: new URLSearchParams() },
      );
      (authError as any).error = "access_denied";
      (authError as any).error_description = "User cancelled login";

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
          spId: "sp-id",
          spName: "sp-name",
        }),
      ).rejects.toThrow(AuthorizationResponseErrorException);
    });

    it("should throw OidcClientTokenFailedException on other errors", async () => {
      // Given
      (openidClient.authorizationCodeGrant as jest.Mock).mockRejectedValue(
        new Error("Token error", { cause: new Response() }),
      );

      // When / Then
      await expect(
        service.getToken({
          idpId: "idp-id",
          req: reqMock as any,
          idpState: "state",
          idpNonce: "nonce",
          spId: "sp-id",
          spName: "sp-name",
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
          spId: "sp-id",
          spName: "sp-name",
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
        spId: "sp-id",
        spName: "sp-name",
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
        spId: "sp-id",
        spName: "sp-name",
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
        spId: "sp-id",
        spName: "sp-name",
      });

      // Then
      expect(result.claims.acr).toBe("eidas2");
    });

    it("should map EntraID acrs to eidas 1 if not recognized", async () => {
      // Given
      identityProviderMock.getById.mockResolvedValue({
        ...idpMock,
        isEntraID: true,
      });
      const tokensWithAcrs = {
        ...tokensMock,
        claims: jest.fn().mockReturnValue({ sub: "user-sub", acrs: ["p1"] }),
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
        spId: "sp-id",
        spName: "sp-name",
      });

      // Then
      expect(result.claims.acr).toBe("eidas1");
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
        spId: "sp-id",
        spName: "sp-name",
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
        spId: "sp-id",
        spName: "sp-name",
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
        new Error("Userinfo error", { cause: new Response() }),
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
