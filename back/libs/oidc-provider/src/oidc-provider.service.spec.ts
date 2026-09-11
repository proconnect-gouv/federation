import { LoggerService } from "@fc/logger";
import { RedisService } from "@fc/redis";
import { SessionService } from "@fc/session";
import { getLoggerMock } from "@mocks/logger";
import { getRedisServiceMock } from "@mocks/redis";
import { getSessionServiceMock } from "@mocks/session";
import { Test, TestingModule } from "@nestjs/testing";
import { Response } from "express";
import OidcProvider from "oidc-provider";
import {
  OidcProviderMiddlewarePattern,
  OidcProviderMiddlewareStep,
} from "./enums";
import { OidcProviderInitialisationException } from "./exceptions";
import { COOKIES, OidcProviderService } from "./oidc-provider.service";
import { OidcProviderConfigService } from "./services/oidc-provider-config.service";

describe("OidcProviderService", () => {
  let service: OidcProviderService;

  const loggerMock = getLoggerMock();

  const ProviderProxyMock = class {
    callback = jest.fn();
    on = jest.fn();
  } as any;

  const BadProviderProxyMock = class {
    constructor() {
      throw Error("not Working");
    }
  } as any;

  const configServiceMock = {
    get: jest.fn(),
  };
  const oidcProviderRedisAdapterMock = class AdapterMock {};
  const configOidcProviderMock = {
    prefix: "/api",
    issuer: "http://foo.bar",
    configuration: {
      adapter: oidcProviderRedisAdapterMock,
      jwks: { keys: [] },
      features: {
        devInteractions: { enabled: false },
      },
      cookies: {
        keys: ["foo"],
      },
    },
  };

  const serviceProviderListMock = [{ name: "my SP" }];
  const serviceProviderServiceMock = {
    getList: jest.fn(),
    getById: jest.fn(),
  };

  const useSpy = jest.fn();

  const providerMock = {
    middlewares: [],
    use: (middleware) => {
      providerMock.middlewares.push(middleware);
      useSpy();
    },
    on: jest.fn(),
    interactionDetails: jest.fn(),
    interactionFinished: jest.fn(),
  };

  const redisMock = getRedisServiceMock();
  const sessionServiceMock = getSessionServiceMock();

  const oidcProviderConfigServiceMock = {
    getConfig: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        OidcProviderService,
        RedisService,
        OidcProviderConfigService,
        SessionService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(RedisService)
      .useValue(redisMock)
      .overrideProvider(OidcProviderConfigService)
      .useValue(oidcProviderConfigServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .compile();

    service = module.get<OidcProviderService>(OidcProviderService);
    jest.resetAllMocks();

    configServiceMock.get.mockImplementation((module) => {
      switch (module) {
        case "OidcProvider":
          return configOidcProviderMock;
      }
    });

    service["provider"] = providerMock as any;

    serviceProviderServiceMock.getById.mockResolvedValue(
      serviceProviderListMock[0],
    );
    serviceProviderServiceMock.getList.mockResolvedValue(
      serviceProviderListMock,
    );
  });

  describe("onModuleInit", () => {
    beforeEach(() => {
      // Given
      oidcProviderConfigServiceMock.getConfig.mockReturnValueOnce(
        configOidcProviderMock,
      );
      oidcProviderConfigServiceMock.getConfig.mockImplementation(() => ({
        paramsMock: "paramMocks",
      }));
      service["getConfig"] = jest.fn().mockResolvedValue({
        ...configOidcProviderMock,
      });
      service["registerMiddlewares"] = jest.fn();
    });

    it("should create oidc-provider instance", () => {
      // When
      service.onModuleInit();
      // Then
      expect(service).toBeDefined();
      // Access to private property via []
      expect(service["provider"]).toBeInstanceOf(OidcProvider);
    });

    it("should throw if provider can not be instantied", () => {
      // Given
      service["ProviderProxy"] = BadProviderProxyMock;
      // Then
      expect(() => service.onModuleInit()).toThrow(
        OidcProviderInitialisationException,
      );
    });
  });

  describe("getProvider", () => {
    it("should return the oidc-provider instance", () => {
      // When
      const result = service.getProvider();
      // Then
      expect(result).toBe(service["provider"]);
    });
  });

  describe("getCallback", () => {
    it("should return the oidc-provider instance", () => {
      // When
      const result = service.getCallback();
      // Then
      expect(result).toBe(service["callback"]);
    });
  });

  describe("registerMiddleware", () => {
    it("should register middleware but not call callback on middleware registration", () => {
      // Given
      providerMock.middlewares = [];
      const callback = jest.fn();
      // When
      service.registerMiddleware(
        OidcProviderMiddlewareStep.BEFORE,
        OidcProviderMiddlewarePattern.USERINFO,
        callback,
      );
      // Then
      expect(useSpy).toBeCalledTimes(1);
      expect(providerMock.middlewares).toHaveLength(1);
      expect(callback).toHaveBeenCalledTimes(0);
    });

    it("should call provider use with callback function BEFORE", () => {
      // Given
      providerMock.middlewares = [];
      const callback = jest.fn();
      const ctx = { path: OidcProviderMiddlewarePattern.USERINFO };
      const next = jest.fn().mockResolvedValue(undefined);
      service["runMiddlewareBeforePattern"] = jest.fn();
      // When
      service.registerMiddleware(
        OidcProviderMiddlewareStep.BEFORE,
        OidcProviderMiddlewarePattern.USERINFO,
        callback,
      );
      providerMock.middlewares[0].call(null, ctx, next);
      // Then
      expect(service["runMiddlewareBeforePattern"]).toHaveBeenCalledTimes(1);
    });

    it("should call provider use with callback function AFTER", async () => {
      // Given
      providerMock.middlewares = [];
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      const next = jest.fn().mockResolvedValue(undefined);
      service["runMiddlewareAfterPattern"] = jest.fn();
      // When
      service.registerMiddleware(
        OidcProviderMiddlewareStep.AFTER,
        OidcProviderMiddlewarePattern.USERINFO,
        callback,
      );
      await providerMock.middlewares[0].call(null, ctx, next);
      // Then
      expect(service["runMiddlewareAfterPattern"]).toHaveBeenCalledTimes(1);
    });

    it("should match on path", async () => {
      // Given
      providerMock.middlewares = [];
      const callback = jest.fn();
      const ctx = {
        path: OidcProviderMiddlewarePattern.USERINFO,
      };
      const next = jest.fn().mockResolvedValue(undefined);
      // When
      service.registerMiddleware(
        OidcProviderMiddlewareStep.AFTER,
        OidcProviderMiddlewarePattern.USERINFO,
        callback,
      );
      await providerMock.middlewares[0].call(null, ctx, next);
      // Then
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("runMiddlewareBeforePattern", () => {
    it("should call the callback if path param equal pattern with good step", async () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      await service["runMiddlewareBeforePattern"](
        {
          step: OidcProviderMiddlewareStep.BEFORE,
          path: OidcProviderMiddlewarePattern.USERINFO,
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should not call the callback method if wrong path is send", async () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      await service["runMiddlewareBeforePattern"](
        {
          step: OidcProviderMiddlewareStep.BEFORE,
          path: "",
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(0);
    });

    it("should not call the callback method if wrong step is send", async () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      await service["runMiddlewareBeforePattern"](
        {
          step: OidcProviderMiddlewareStep.AFTER,
          path: OidcProviderMiddlewarePattern.USERINFO,
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(0);
    });
  });

  describe("runMiddlewareAfterPattern", () => {
    it("should call the callback if route param equal pattern with good step", async () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      await service["runMiddlewareAfterPattern"](
        {
          step: OidcProviderMiddlewareStep.AFTER,
          route: OidcProviderMiddlewarePattern.USERINFO,
          path: "",
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should call the callback if path param equal pattern with good step", async () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      await service["runMiddlewareAfterPattern"](
        {
          step: OidcProviderMiddlewareStep.AFTER,
          route: "",
          path: OidcProviderMiddlewarePattern.USERINFO,
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should not call the callback method if wrong step is send", async () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      await service["runMiddlewareAfterPattern"](
        {
          step: OidcProviderMiddlewareStep.BEFORE,
          route: OidcProviderMiddlewarePattern.USERINFO,
          path: OidcProviderMiddlewarePattern.USERINFO,
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(0);
    });

    it("should not call the callback method if wrong path or route is send", async () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      await service["runMiddlewareAfterPattern"](
        {
          step: OidcProviderMiddlewareStep.BEFORE,
          route: "",
          path: "",
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(0);
    });

    it("should not call the callback method if context indicates an error in oidc interaction", async () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO, isError: true },
      };

      // When
      await service["runMiddlewareAfterPattern"](
        {
          step: OidcProviderMiddlewareStep.AFTER,
          route: "",
          path: OidcProviderMiddlewarePattern.USERINFO,
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );

      // Then
      expect(callback).toHaveBeenCalledTimes(0);
    });
  });

  describe("getInteraction", () => {
    it("should return the result of oidc-provider.interactionDetails()", async () => {
      // Given
      const reqMock = {};
      const resMock = {};
      const resolvedValue = {
        prompt: {
          name: Symbol("name"),
          reasons: Symbol("reasons"),
        },
      };
      providerMock.interactionDetails.mockResolvedValueOnce(resolvedValue);
      // When
      const result = await service.getInteraction(reqMock, resMock);
      // Then
      expect(result).toBe(resolvedValue);
    });
  });

  describe("abortInteraction", () => {
    it("should have called this.provider.interactionFinished with parameters if retry params is false", async () => {
      // given
      const resMock = Symbol("mock result");
      const reqMock = Symbol("mock request");
      const mockErr = "this is an error message";
      const mockErrDescription = "this is an error description";

      // when
      await service.abortInteraction(reqMock, resMock, {
        error: mockErr,
        error_description: mockErrDescription,
      });

      // then
      expect(providerMock.interactionFinished).toHaveBeenCalledTimes(1);
      expect(providerMock.interactionFinished).toHaveBeenCalledWith(
        reqMock,
        resMock,
        {
          error: mockErr,
          error_description: mockErrDescription,
        },
      );
    });

    it("should have called this.provider.interactionFinished with error undefined if retry params is true", async () => {
      // given
      const resMock = Symbol("mock result");
      const reqMock = Symbol("mock request");

      // when
      await service.abortInteraction(
        reqMock,
        resMock,
        {
          error: "error",
          error_description: "error description",
        },
        true,
      );

      // then
      expect(providerMock.interactionFinished).toHaveBeenCalledTimes(1);
      expect(providerMock.interactionFinished).toHaveBeenCalledWith(
        reqMock,
        resMock,
        {
          error: undefined,
        },
      );
    });
  });

  describe("finishInteraction()", () => {
    // Given
    const reqMock = {
      fc: { interactionId: "interactiondMockValue" },
    };
    const resMock = {};
    const spIdentityMock = { sub: "test-sub" };

    beforeEach(() => {
      sessionServiceMock.getId.mockReturnValue("sessionId");
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: spIdentityMock,
      });
    });

    it("should finish interaction with grant", async () => {
      // Given
      const resultMock = {
        consent: {},
        login: {
          accountId: spIdentityMock.sub,
          acr: "acrValue",
          amr: ["amrValue"],
          ts: expect.any(Number),
          remember: false,
        },
      };
      providerMock.interactionFinished.mockResolvedValueOnce("ignoredValue");
      // When
      await service.finishInteraction(reqMock, resMock, {
        amr: ["amrValue"],
        acr: "acrValue",
      });

      // Then
      expect(sessionServiceMock.get).toHaveBeenCalledWith("User");
      expect(sessionServiceMock.setAlias).toHaveBeenCalledWith(
        spIdentityMock.sub,
        "sessionId",
      );
      expect(providerMock.interactionFinished).toHaveBeenCalledTimes(1);
      expect(providerMock.interactionFinished).toHaveBeenCalledWith(
        reqMock,
        resMock,
        resultMock,
      );
    });
  });

  describe("clearCookies", () => {
    it("should iterate over COOKIES and call res.clearCookie with entry from COOKIES", () => {
      // Given
      const resMock = {
        clearCookie: jest.fn(),
      } as unknown as Response;
      // When
      service.clearCookies(resMock);
      // Then
      expect(resMock.clearCookie).toHaveBeenCalledTimes(3);

      expect(resMock.clearCookie).toHaveBeenNthCalledWith(1, COOKIES[0]);
      expect(resMock.clearCookie).toHaveBeenNthCalledWith(2, COOKIES[1]);
      expect(resMock.clearCookie).toHaveBeenNthCalledWith(3, COOKIES[2]);
    });
  });
});
