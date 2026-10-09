import { ConfigService } from "#libs/config";
import { generateErrorId } from "#libs/exceptions/helpers/index";
import { LoggerService } from "#libs/logger";
import { OidcProviderService } from "#libs/oidc-provider";
import { SessionService } from "#libs/session";
import { getConfigMock } from "#mocks/config";
import { getLoggerMock } from "#mocks/logger";
import { getSessionServiceMock } from "#mocks/session";
import { ArgumentsHost } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { errors } from "oidc-provider";
import { InvalidSessionException } from "../exceptions";
import { InvalidSessionExceptionFilter } from "./invalid-session-exception.filter";
import SessionNotFound = errors.SessionNotFound;

jest.mock("#libs/exceptions/helpers/index", () => ({
  ...jest.requireActual("#libs/exceptions/helpers/index"),
  generateErrorId: jest.fn(),
}));

describe("InvalidSessionExceptionFilter", () => {
  let filter: InvalidSessionExceptionFilter;

  const generateErrorIdMock = jest.mocked(generateErrorId);

  const configMock = getConfigMock();
  const loggerMock = getLoggerMock();
  const sessionMock = getSessionServiceMock();
  const oidcProviderServiceMock = {
    getInteraction: jest.fn(),
  };

  const hostMock = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
    getResponse: jest.fn(),
  };

  let exceptionMock: InvalidSessionException;

  const resMock = {
    status: jest.fn(),
    render: jest.fn(),
  } as any;

  const idMock = "error-id-123";

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvalidSessionExceptionFilter,
        ConfigService,
        SessionService,
        LoggerService,
        OidcProviderService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(SessionService)
      .useValue(sessionMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .compile();

    filter = module.get<InvalidSessionExceptionFilter>(
      InvalidSessionExceptionFilter,
    );

    hostMock.switchToHttp.mockReturnThis();
    hostMock.getResponse.mockReturnValue(resMock);

    generateErrorIdMock.mockReturnValue(idMock);

    resMock.status.mockReturnThis();
    configMock.get.mockReturnValue({ prefix: "Y" });

    exceptionMock = new InvalidSessionException();
  });

  it("should be defined", () => {
    expect(filter).toBeDefined();
  });

  describe("catch", () => {
    it("should log and display an error", async () => {
      // Given
      oidcProviderServiceMock.getInteraction.mockReturnValue({
        uid: "uidMockValue",
      });

      // When
      await filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);

      // Then
      expect(loggerMock.error).toHaveBeenCalledOnce();
      expect(resMock.render).toHaveBeenCalledOnce();
    });

    it("should log and display an error when getInteraction throw an error", async () => {
      // Given
      oidcProviderServiceMock.getInteraction.mockRejectedValueOnce(
        new SessionNotFound("message", 1),
      );

      // When
      await filter.catch(exceptionMock, hostMock as unknown as ArgumentsHost);

      // Then
      expect(loggerMock.error).toHaveBeenCalledOnce();
      expect(resMock.render).toHaveBeenCalledOnce();
    });
  });
});
