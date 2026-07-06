import { ConfigService } from "@fc/config";
import { LoggerService } from "@fc/logger";
import { SERVICE_PROVIDER_SERVICE_TOKEN } from "@fc/oidc";
import { SessionService } from "@fc/session";
import { getLoggerMock } from "@mocks/logger";
import { getSessionServiceMock } from "@mocks/session";
import { Test, TestingModule } from "@nestjs/testing";
import { KoaContextWithOIDC } from "oidc-provider";
import { OidcProviderConfigService } from "./oidc-provider-config.service";

describe("OidcProviderConfigService", () => {
  let service: OidcProviderConfigService;

  const configServiceMock = {
    get: jest.fn(),
  };

  const serviceProviderServiceMock = {
    getById: jest.fn(),
  };

  const loggerServiceMock = getLoggerMock();
  const sessionServiceMock = getSessionServiceMock();

  const oidcProviderRedisAdapterMock = class AdapterMock {};

  const configOidcProviderMock = {
    issuer: "http://foo.bar",
    configuration: {
      adapter: oidcProviderRedisAdapterMock,
      features: {
        devInteractions: { enabled: false },
      },
    },
  };

  const atHashMock = "at_hash Mock value";
  const sessionId = "sessionIdMock value";
  const reqMock = { sessionId };
  const resMock = {};

  const ctxMock = {
    sessionId,
    req: reqMock,
    res: resMock,
    oidc: {
      entities: {
        IdTokenHint: {
          payload: {
            at_hash: atHashMock,
          },
        },
      },
      session: {
        accountId: "test-sub",
      },
    },
  } as unknown as KoaContextWithOIDC;

  const form =
    '<form id="logoutId" method="post" action="https://redirect/me/there"><input type="hidden" name="xsrf" value="123456azerty"/></form>';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcProviderConfigService,
        ConfigService,
        LoggerService,
        SessionService,
        {
          provide: SERVICE_PROVIDER_SERVICE_TOKEN,
          useValue: serviceProviderServiceMock,
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .compile();

    service = module.get<OidcProviderConfigService>(OidcProviderConfigService);
    jest.resetAllMocks();

    configServiceMock.get.mockImplementation((module) => {
      switch (module) {
        case "OidcProvider":
          return configOidcProviderMock;
      }
    });
  });

  describe("url()", () => {
    it("should return a relative interaction url with prefix", () => {
      // Given
      const prefix = "/prefix";
      const ctx = {
        oidc: {
          entities: {
            interaction: {
              uid: 123,
            },
          },
        },
      } as unknown as KoaContextWithOIDC;
      const { interaction } = ctx.oidc.entities;

      // When
      const result = service["url"](prefix, ctx, interaction);

      // Then
      expect(result).toEqual("/prefix/interaction/123");
    });
  });

  describe("postLogoutSuccessSource", () => {
    it("should set a body property to koa context", () => {
      // Given
      const renderMock = jest.fn();
      const ctx = {
        res: { render: renderMock },
      } as unknown as KoaContextWithOIDC;

      // When
      service["postLogoutSuccessSource"]!(ctx);

      // Then
      expect(renderMock).toHaveBeenCalledOnce();
    });
  });

  describe("logoutSource", () => {
    it("should render logout page", () => {
      // When
      service["logoutSource"]!(ctxMock, form);

      // Then
      expect(ctxMock.body).toBeDefined();
    });
  });

  describe("findAccount", () => {
    it("should return account details with accountId and claims when session is valid", async () => {
      // Given
      const sub = "test-sub";
      const sessionId = "test-session-id";
      const spIdentityMock = {
        sub: "test-sub",
        given_name: "John",
        family_name: "Doe",
      };
      sessionServiceMock.getAlias.mockResolvedValueOnce(sessionId);
      sessionServiceMock.initCache.mockResolvedValueOnce(true);
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: spIdentityMock,
      });

      // When
      const result = await service.findAccount!(ctxMock, sub);

      // Then
      expect(sessionServiceMock.getAlias).toHaveBeenCalledWith(sub);
      expect(result).toEqual({
        accountId: spIdentityMock.sub,
        claims: expect.any(Function),
      });

      // Claims function test
      const claims = await result!.claims(
        "userinfo",
        "openid given_name family_name",
        {},
        [],
      );
      expect(claims).toEqual(spIdentityMock);
    });
  });

  describe("renderError", () => {
    it("should set ctx.type to html and render the error template with details", async () => {
      // Given
      const renderReturnMock = "rendered-html";
      const renderMock = jest.fn().mockReturnValue(renderReturnMock);
      const ctx = {
        res: { render: renderMock },
      } as unknown as KoaContextWithOIDC;

      const params = {
        error: "access_denied",
        error_description: "Not allowed",
      } as unknown as Parameters<
        NonNullable<OidcProviderConfigService["renderError"]>
      >[1];

      // When
      await service.renderError!(ctx, params, new Error("boom"));

      // Then
      expect(ctx).toHaveProperty("type", "html");
      expect(renderMock).toHaveBeenCalledTimes(1);
      expect(renderMock).toHaveBeenCalledWith("error", {
        error: {
          code: "oidc-provider-rendered-error:access_denied",
          id: expect.any(String),
          message: "Not allowed",
        },
        exceptionDisplay: {},
      });
      expect(ctx).toHaveProperty("body", renderReturnMock);
    });
  });
});
