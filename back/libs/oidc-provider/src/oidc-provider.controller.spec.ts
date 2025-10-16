import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@fc/logger';
import { SERVICE_PROVIDER_SERVICE_TOKEN } from '@fc/oidc/tokens';

import { getLoggerMock } from '@mocks/logger';

import {
  AuthorizeParamsDto,
  LogoutParamsDto,
  RevocationTokenParamsDTO,
} from './dto';
import { OidcProviderRenderedJsonExceptionFilter } from './filters';
import { OidcProviderController } from './oidc-provider.controller';
import { OidcProviderService } from './oidc-provider.service';
import { OidcProviderConfigAppService } from './services';

describe('OidcProviderController', () => {
  let oidcProviderController: OidcProviderController;

  const loggerMock = getLoggerMock();

  const providerMock = {
    interactionDetails: jest.fn(),
  };

  const oidcProviderServiceMock = {
    getProvider: () => providerMock,
    wellKnownKeys: jest.fn(),
    decodeAuthorizationHeader: jest.fn(),
  };

  const serviceProviderServiceMock = {
    isActive: jest.fn(),
  };

  const oidcProviderConfigAppMock = {
    finishInteraction: jest.fn(),
  };

  const jsonExceptionFilterMock = {
    catch: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OidcProviderController],
      providers: [
        OidcProviderService,
        {
          provide: SERVICE_PROVIDER_SERVICE_TOKEN,
          useValue: serviceProviderServiceMock,
        },
        OidcProviderConfigAppService,
        LoggerService,
      ],
    })
      .overrideFilter(OidcProviderRenderedJsonExceptionFilter)
      .useValue(jsonExceptionFilterMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(OidcProviderConfigAppService)
      .useValue(oidcProviderConfigAppMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    oidcProviderController = app.get<OidcProviderController>(
      OidcProviderController,
    );

    serviceProviderServiceMock.isActive.mockResolvedValue(true);

    jest.resetAllMocks();
  });

  describe('getAuthorize()', () => {
    it('should call next', () => {
      // Given
      const next = jest.fn();
      const queryMock = {} as AuthorizeParamsDto;
      // When
      oidcProviderController.getAuthorize(next, queryMock);
      // Then
      expect(next).toHaveReturnedTimes(1);
    });
  });

  describe('postAuthorize()', () => {
    it('should call next', () => {
      // Given
      const next = jest.fn();
      const bodyMock = {} as AuthorizeParamsDto;
      // When
      oidcProviderController.postAuthorize(next, bodyMock);
      // Then
      expect(next).toHaveReturnedTimes(1);
    });
  });

  describe('getUserInfo()', () => {
    it('should call identity service', () => {
      // Given
      const next = jest.fn();

      // When
      oidcProviderController.getUserInfo(next);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('postToken()', () => {
    it('should call next()', () => {
      // Given
      const next = jest.fn();
      // When
      oidcProviderController.postToken(next);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEndSession()', () => {
    it('should call logout service', () => {
      // Given
      const next = jest.fn();
      const queryMock = {} as LogoutParamsDto;

      // When
      oidcProviderController.getEndSession(next, queryMock);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('revokeToken()', () => {
    it('should call next()', () => {
      // Given
      const next = jest.fn();
      const bodyMock = {} as RevocationTokenParamsDTO;
      // When
      oidcProviderController.revokeToken(next, bodyMock);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getJwks()', () => {
    it('should call next()', () => {
      // Given
      const next = jest.fn();
      // When
      oidcProviderController.getJwks(next);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOpenidConfiguration()', () => {
    it('should call next()', () => {
      // Given
      const next = jest.fn();
      // When
      oidcProviderController.getOpenidConfiguration(next);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
