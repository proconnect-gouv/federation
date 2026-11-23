import { ConfigService } from "#libs/config";
import { IdentityProviderAdapterMongoService } from "#libs/identity-provider-adapter-mongo";
import { LoggerService } from "#libs/logger";
import {
  OidcCtx,
  OidcProviderGrantIdentityService,
  OidcProviderService,
} from "#libs/oidc-provider";
import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";
import { SessionNotFoundException, SessionService } from "#libs/session";
import { getLoggerMock } from "#mocks/logger";
import { getSessionServiceMock } from "#mocks/session";
import { Test, TestingModule } from "@nestjs/testing";
import { validate } from "class-validator";
import { CoreFcaMiddlewareService } from "./core-fca-middleware.service";

jest.mock("class-validator", () => ({
  ...jest.requireActual("class-validator"),
  validate: jest.fn(),
}));
jest.mock("#libs/exceptions/helpers/index", () => ({
  ...jest.requireActual("#libs/exceptions/helpers/index"),
  throwException: jest.fn(),
}));

describe("CoreFcaMiddlewareService", () => {
  let service: CoreFcaMiddlewareService;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockOidcProviderService: jest.Mocked<OidcProviderService>;
  let mockSessionService: jest.Mocked<SessionService>;
  const mockLoggerService: jest.Mocked<LoggerService> = getLoggerMock();
  let validateMock: jest.Mock;
  const grantIdentityMock = { save: jest.fn(), findFromLoadedGrant: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaMiddlewareService,
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        {
          provide: OidcProviderService,
          useValue: { registerMiddleware: jest.fn(), clearCookies: jest.fn() },
        },
        { provide: SessionService, useValue: getSessionServiceMock() },
        { provide: ServiceProviderAdapterMongoService, useValue: jest.fn() },
        { provide: IdentityProviderAdapterMongoService, useValue: jest.fn() },
        {
          provide: OidcProviderGrantIdentityService,
          useValue: grantIdentityMock,
        },
      ],
    }).compile();

    service = module.get<CoreFcaMiddlewareService>(CoreFcaMiddlewareService);
    mockConfigService = module.get<ConfigService>(
      ConfigService,
    ) as jest.Mocked<ConfigService>;
    mockOidcProviderService = module.get<OidcProviderService>(
      OidcProviderService,
    ) as jest.Mocked<OidcProviderService>;
    mockSessionService = module.get<SessionService>(
      SessionService,
    ) as jest.Mocked<SessionService>;
    validateMock = jest.mocked(validate);
  });

  it("should register all middleware in onModuleInit", () => {
    const spy = jest.spyOn((service as any).oidcProvider, "registerMiddleware");
    service.onModuleInit();
    expect(spy).toHaveBeenCalledTimes(4);
  });

  it("should handle errors in koaHtmlErrorFormatterMiddlewareFactory correctly", async () => {
    const mockCtx = {
      oidc: {},
      req: {},
      res: { render: jest.fn() },
    };
    const middleware = jest.fn().mockRejectedValue(new Error("Test Error"));
    const formatter = (service as any).koaHtmlErrorFormatterMiddlewareFactory(
      middleware,
    );
    await expect(formatter(mockCtx)).rejects.toThrow();
    expect(mockCtx.res.render).toHaveBeenCalled();
  });

  it("should reset cookies and clear headers in beforeAuthorizeMiddleware", () => {
    const mockCtx = { req: { headers: {} }, res: {} } as any as OidcCtx;
    const spy = jest.spyOn(mockOidcProviderService, "clearCookies");

    (service as any).beforeAuthorizeMiddleware(mockCtx);
    expect(spy).toHaveBeenCalledWith(mockCtx.res);
    expect(mockCtx.req.headers.cookie).toBe("");
  });

  it("should log warning for unsupported methods and override prompt in overrideAuthorizePrompt", () => {
    mockConfigService.get.mockReturnValue({
      forcedPrompt: ["login", "consent"],
    });

    const postCtx = {
      method: "POST",
      req: { body: { prompt: "login" } },
    } as any as OidcCtx;
    (service as any).overrideAuthorizePrompt(postCtx);
    expect(postCtx.req.body.prompt).toBe("login consent");

    const getCtx = {
      method: "GET",
      query: { prompt: "login" },
    } as any as OidcCtx;
    (service as any).overrideAuthorizePrompt(getCtx);
    expect(getCtx.query.prompt).toBe("login consent");

    const unsupportedCtx = {
      method: "PUT",
      req: { body: {} },
      query: {},
    } as any as OidcCtx;
    (service as any).overrideAuthorizePrompt(unsupportedCtx);
    expect(unsupportedCtx.req.body.prompt).toBeUndefined();
    expect(unsupportedCtx.query.prompt).toBeUndefined();
  });

  describe("loadSessionInAsyncLocalStorage", () => {
    const mockCtx = {
      oidc: {
        entities: {
          Grant: { jti: "grant-id" },
        },
      },
    };

    beforeEach(() => {
      grantIdentityMock.findFromLoadedGrant.mockReset();
    });

    it("should load the session of the login that issued the grant", async () => {
      grantIdentityMock.findFromLoadedGrant.mockResolvedValueOnce({
        spIdentity: { sub: "test-sub" },
        sessionId: "session-id",
      });

      const { isSessionLoaded } = await (
        service as any
      ).loadSessionInAsyncLocalStorage(mockCtx);

      expect(grantIdentityMock.findFromLoadedGrant).toHaveBeenCalledWith(
        mockCtx,
      );
      expect(mockSessionService.initCache).toHaveBeenCalledWith("session-id");
      expect(isSessionLoaded).toBeTrue();
    });

    it("should return { isSessionLoaded: false } if the grant has no identity", async () => {
      grantIdentityMock.findFromLoadedGrant.mockResolvedValueOnce(undefined);

      const { isSessionLoaded } = await (
        service as any
      ).loadSessionInAsyncLocalStorage(mockCtx);

      expect(mockSessionService.initCache).not.toHaveBeenCalled();
      expect(isSessionLoaded).toBeFalse();
    });

    it("should return { isSessionLoaded: false } if the session has expired", async () => {
      grantIdentityMock.findFromLoadedGrant.mockResolvedValueOnce({
        spIdentity: { sub: "test-sub" },
        sessionId: "session-id",
      });
      mockSessionService.initCache.mockRejectedValueOnce(
        new SessionNotFoundException(),
      );

      const { isSessionLoaded } = await (
        service as any
      ).loadSessionInAsyncLocalStorage(mockCtx);

      expect(isSessionLoaded).toBeFalse();
    });

    it("should rethrow the other errors when loading the session", async () => {
      grantIdentityMock.findFromLoadedGrant.mockResolvedValueOnce({
        spIdentity: { sub: "test-sub" },
        sessionId: "session-id",
      });
      const error = new Error("redis unavailable");
      mockSessionService.initCache.mockRejectedValueOnce(error);

      await expect(
        (service as any).loadSessionInAsyncLocalStorage(mockCtx),
      ).rejects.toBe(error);
    });
  });

  it("should load the session and track event in tokenMiddleware", async () => {
    const mockCtx = {
      oidc: {
        entities: {
          AccessToken: {},
          Grant: { jti: "grant-id" },
        },
      },
    };
    grantIdentityMock.findFromLoadedGrant.mockResolvedValueOnce({
      spIdentity: { sub: "test-sub" },
      sessionId: "session-id",
    });
    const spyInitCache = jest.spyOn(mockSessionService, "initCache");
    const spyTrack = jest.spyOn(mockLoggerService, "track");
    await (service as any).tokenMiddleware(mockCtx);
    expect(spyInitCache).toHaveBeenCalledWith("session-id");
    expect(spyTrack).toHaveBeenCalled();
  });

  it("should load the session and track event in userinfoMiddleware", async () => {
    const mockCtx = {
      oidc: {
        entities: {
          Grant: { jti: "grant-id" },
        },
      },
    };
    grantIdentityMock.findFromLoadedGrant.mockResolvedValueOnce({
      spIdentity: { sub: "test-sub" },
      sessionId: "session-id",
    });
    const spyInitCache = jest.spyOn(mockSessionService, "initCache");
    const spyTrack = jest.spyOn(mockLoggerService, "track");
    await (service as any).userinfoMiddleware(mockCtx);
    expect(spyInitCache).toHaveBeenCalledWith("session-id");
    expect(spyTrack).toHaveBeenCalled();
  });

  it("should handle silent authentication prompts in handleSilentAuthenticationMiddleware", async () => {
    const mockCtx = { method: "POST", req: { body: { prompt: "none" } } };
    const spyOverride = jest.spyOn(service as any, "overrideAuthorizePrompt");
    mockSessionService.get.mockReturnValueOnce({});
    validateMock.mockResolvedValueOnce([]);
    mockConfigService.get.mockReturnValueOnce({
      forcedPrompt: ["login", "consent"],
    });
    await (service as any).handleSilentAuthenticationMiddleware(mockCtx);
    expect(spyOverride).toHaveBeenCalled();
  });

  it("should handle silent authentication prompts in handleSilentAuthenticationMiddleware", async () => {
    const mockCtx = { method: "GET", query: {} };
    const spyOverride = jest.spyOn(service as any, "overrideAuthorizePrompt");
    mockConfigService.get.mockReturnValueOnce({
      forcedPrompt: ["login", "consent"],
    });
    await (service as any).handleSilentAuthenticationMiddleware(mockCtx);
    expect(spyOverride).toHaveBeenCalled();
  });
});
