import { LoggerService } from "#libs/logger";
import { OidcCtx, OidcProviderService } from "#libs/oidc-provider";
import { SessionService } from "#libs/session";
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
  let mockOidcProviderService: jest.Mocked<OidcProviderService>;
  let mockSessionService: jest.Mocked<SessionService>;
  const mockLoggerService: jest.Mocked<LoggerService> = getLoggerMock();
  let validateMock: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaMiddlewareService,
        { provide: LoggerService, useValue: mockLoggerService },
        {
          provide: OidcProviderService,
          useValue: { registerMiddleware: jest.fn(), clearCookies: jest.fn() },
        },
        { provide: SessionService, useValue: getSessionServiceMock() },
      ],
    }).compile();

    service = module.get<CoreFcaMiddlewareService>(CoreFcaMiddlewareService);
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

  it("should call sessionService.initCache and return { isSessionLoaded: true } in loadSessionInAsyncLocalStorage", async () => {
    const mockCtx = {
      oidc: { entities: { Account: { accountId: "123" } } },
      req: {},
    };
    mockSessionService.getAlias.mockResolvedValueOnce("123");
    const { isSessionLoaded } = await (
      service as any
    ).loadSessionInAsyncLocalStorage(mockCtx);

    expect(mockSessionService.initCache).toHaveBeenCalled();
    expect(isSessionLoaded).toBeTrue();
  });

  it("should return { isSessionLoaded: false } if there is no accountId in ctx", async () => {
    const mockCtx = { oidc: {}, req: {} };
    const { isSessionLoaded } = await (
      service as any
    ).loadSessionInAsyncLocalStorage(mockCtx);
    expect(isSessionLoaded).toBeFalse();
  });

  it("should initialize session, set alias, and track event in tokenMiddleware", async () => {
    const mockCtx = {
      oidc: { entities: { AccessToken: {}, Account: { accountId: "123" } } },
    };
    mockSessionService.getAlias.mockResolvedValueOnce("123");
    const spyInitCache = jest.spyOn(mockSessionService, "initCache");
    const spyTrack = jest.spyOn(mockLoggerService, "track");
    await (service as any).tokenMiddleware(mockCtx);
    expect(spyInitCache).toHaveBeenCalled();
    expect(spyTrack).toHaveBeenCalled();
  });

  it("should initialize session and track event in userinfoMiddleware", async () => {
    const mockCtx = {
      oidc: { entities: { Account: { accountId: "123" } } },
    };
    mockSessionService.getAlias.mockResolvedValueOnce("123");
    const spyInitCache = jest.spyOn(mockSessionService, "initCache");
    const spyTrack = jest.spyOn(mockLoggerService, "track");
    await (service as any).userinfoMiddleware(mockCtx);
    expect(spyInitCache).toHaveBeenCalled();
    expect(spyTrack).toHaveBeenCalled();
  });

  describe("handleSilentAuthenticationMiddleware", () => {
    beforeEach(() => {
      validateMock.mockReset();
    });

    it.each([
      ["POST", { method: "POST", req: { body: {} } }],
      ["GET", { method: "GET", query: {} }],
    ])(
      "should force prompt=login when prompt is missing (%s)",
      async (_method, ctx: any) => {
        await (service as any).handleSilentAuthenticationMiddleware(ctx);

        const params = ctx.method === "POST" ? ctx.req.body : ctx.query;
        expect(params.prompt).toBe("login");
        expect(validateMock).not.toHaveBeenCalled();
      },
    );

    it("should force prompt=login for prompt=none when the user has an active session", async () => {
      const ctx = { method: "POST", req: { body: { prompt: "none" } } };
      mockSessionService.get.mockReturnValueOnce({});
      validateMock.mockResolvedValueOnce([]);

      await (service as any).handleSilentAuthenticationMiddleware(ctx);

      expect(ctx.req.body.prompt).toBe("login");
    });

    it("should keep prompt=none when the user has no active session", async () => {
      const ctx = { method: "GET", query: { prompt: "none" } };
      mockSessionService.get.mockReturnValueOnce({});
      validateMock.mockResolvedValueOnce([new Error("no active session")]);

      await (service as any).handleSilentAuthenticationMiddleware(ctx);

      expect(ctx.query.prompt).toBe("none");
    });

    it.each(["login", "consent", "none login"])(
      "should keep prompt=%s untouched",
      async (prompt) => {
        const ctx = { method: "GET", query: { prompt } };

        await (service as any).handleSilentAuthenticationMiddleware(ctx);

        expect(ctx.query.prompt).toBe(prompt);
        expect(validateMock).not.toHaveBeenCalled();
      },
    );

    it("should not store anything in the session", async () => {
      const ctx = { method: "GET", query: { prompt: "none" } };
      mockSessionService.get.mockReturnValueOnce({});
      validateMock.mockResolvedValueOnce([]);

      await (service as any).handleSilentAuthenticationMiddleware(ctx);

      expect(mockSessionService.set).not.toHaveBeenCalled();
      expect(mockSessionService.commit).not.toHaveBeenCalled();
    });
  });
});
