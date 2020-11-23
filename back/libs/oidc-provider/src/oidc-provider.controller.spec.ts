import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from '@fc/oidc-provider';
import { OidcProviderController } from './oidc-provider.controller';
import { SERVICE_PROVIDER_SERVICE } from './tokens';
import { AuthorizeParamsDTO, RevocationTokenParamsDTO } from './dto';

describe('OidcProviderController', () => {
  let oidcProviderController: OidcProviderController;

  const providerMock = {
    interactionDetails: jest.fn(),
  };

  const oidcProviderServiceMock = {
    getProvider: () => providerMock,
    wellKnownKeys: jest.fn(),
    decodeAuthorizationHeader: jest.fn(),
    finishInteraction: jest.fn(),
  };

  const serviceProviderServiceMock = {
    isActive: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    verbose: jest.fn(),
    businessEvent: jest.fn(),
    debug: jest.fn(),
  } as unknown) as LoggerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OidcProviderController],
      providers: [
        OidcProviderService,
        LoggerService,
        {
          provide: SERVICE_PROVIDER_SERVICE,
          useValue: serviceProviderServiceMock,
        },
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    oidcProviderController = await app.get<OidcProviderController>(
      OidcProviderController,
    );

    serviceProviderServiceMock.isActive.mockResolvedValue(true);

    jest.resetAllMocks();
  });

  describe('getAuthorize', () => {
    it('should call next', () => {
      // Given
      const nextMock = jest.fn();
      const queryMock = {} as AuthorizeParamsDTO;
      // When
      oidcProviderController.getAuthorize(nextMock, queryMock);
      // Then
      expect(nextMock).toHaveReturnedTimes(1);
    });
  });

  describe('postAuthorize', () => {
    it('should call next', () => {
      // Given
      const nextMock = jest.fn();
      const bodyMock = {} as AuthorizeParamsDTO;
      // When
      oidcProviderController.postAuthorize(nextMock, bodyMock);
      // Then
      expect(nextMock).toHaveReturnedTimes(1);
    });
  });

  describe('getUserInfo', () => {
    it('should call identity service', () => {
      // Given
      const next = jest.fn();

      // When
      oidcProviderController.getUserInfo(next);
      // Then
      expect(next).toBeCalledTimes(1);
    });
  });

  describe('getLogin', () => {
    it('should call service.finishInteraction', async () => {
      // Given
      const req = {};
      const res = {};
      // When
      await oidcProviderController.getLogin(req, res);
      // Then
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledWith(
        req,
        res,
      );
    });
  });

  describe('postToken', () => {
    it('should call next()', () => {
      // Given
      const next = jest.fn();
      // When
      oidcProviderController.postToken(next);
      // Then
      expect(next).toBeCalledTimes(1);
    });
  });

  describe('setEndSession', () => {
    it('should call logout service', () => {
      // Given
      const next = jest.fn();

      // When
      oidcProviderController.getEndSession(next);
      // Then
      expect(next).toBeCalledTimes(1);
    });
  });

  describe('revokeToken', () => {
    it('should call next()', () => {
      // Given
      const next = jest.fn();
      const bodyMock = {} as RevocationTokenParamsDTO;
      // When
      oidcProviderController.revokeToken(next, bodyMock);
      // Then
      expect(next).toBeCalledTimes(1);
    });
  });
});
