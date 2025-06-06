import { Test, TestingModule } from '@nestjs/testing';

import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import { ActiveUserSessionDto } from '@fc/core-fca/dto';
import { LoggerService } from '@fc/logger';
import { OidcAcrService } from '@fc/oidc-acr';
import { IDENTITY_PROVIDER_SERVICE } from '@fc/oidc-client/tokens';
import {
  OidcProviderErrorService,
  OidcProviderService,
} from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { CoreFcaMiddlewareService } from './core-fca-middleware.service';

jest.mock('@fc/common', () => ({
  ...jest.requireActual('@fc/common'),
  validateDto: jest.fn(),
}));

describe('CoreFcaMiddlewareService - handleSilentAuthenticationMiddleware', () => {
  let service: CoreFcaMiddlewareService;
  let sessionServiceMock: ReturnType<typeof getSessionServiceMock>;

  const loggerServiceMock = getLoggerMock();

  const oidcProviderServiceMock = {
    registerMiddleware: jest.fn(),
  };

  const configServiceMock = {};

  const trackingMock = {
    track: jest.fn(),
    TrackedEventsMap: {
      FC_AUTHORIZE_INITIATED: {},
      SP_REQUESTED_FC_TOKEN: {},
      SP_REQUESTED_FC_USERINFO: {},
      FC_SSO_INITIATED: {},
    },
  };

  const serviceProviderServiceMock = {
    getById: jest.fn(),
  };

  const oidcProviderErrorServiceMock = {
    throwError: jest.fn(),
  };

  const oidcAcrServiceMock = {};

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    sessionServiceMock = getSessionServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaMiddlewareService,
        LoggerService,
        OidcProviderService,
        ConfigService,
        SessionService,
        TrackingService,
        ServiceProviderAdapterMongoService,
        OidcAcrService,
        OidcProviderErrorService,
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useValue: {},
        },
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .overrideProvider(ServiceProviderAdapterMongoService)
      .useValue(serviceProviderServiceMock)
      .overrideProvider(OidcProviderErrorService)
      .useValue(oidcProviderErrorServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(OidcAcrService)
      .useValue(oidcAcrServiceMock)
      .compile();

    service = module.get<CoreFcaMiddlewareService>(CoreFcaMiddlewareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit()', () => {
    it('should register 4 middlewares', () => {
      // Given
      service['registerMiddleware'] = jest.fn();
      // When
      service.onModuleInit();
      // Then
      expect(service['registerMiddleware']).toHaveBeenCalledTimes(4);
    });
  });

  describe('handleSilentAuthenticationMiddleware()', () => {
    let ctx: any;
    let overrideAuthorizePromptSpy: jest.SpyInstance;
    let getAuthorizationParametersSpy: jest.SpyInstance;
    let isPromptStrictlyEqualNoneSpy: jest.SpyInstance;
    let validateDtoMock: jest.Mock;

    beforeEach(() => {
      ctx = { prompt: undefined };
      overrideAuthorizePromptSpy = jest
        .spyOn<any, any>(service, 'overrideAuthorizePrompt')
        .mockImplementation(() => {});
      getAuthorizationParametersSpy = jest.spyOn<any, any>(
        service,
        'getAuthorizationParameters',
      );
      isPromptStrictlyEqualNoneSpy = jest.spyOn<any, any>(
        service,
        'isPromptStrictlyEqualNone',
      );
      validateDtoMock = jest.mocked(validateDto);
    });

    it('should immediately call overrideAuthorizePrompt and exit if prompt is not provided', async () => {
      // Arrange: getAuthorizationParameters returns an object without prompt
      getAuthorizationParametersSpy.mockReturnValue({ prompt: undefined });

      // Act
      await service['handleSilentAuthenticationMiddleware'](ctx);

      // Assert
      expect(overrideAuthorizePromptSpy).toHaveBeenCalledTimes(1);
      expect(overrideAuthorizePromptSpy).toHaveBeenCalledWith(ctx);
      expect(sessionServiceMock.set).not.toHaveBeenCalled();
      expect(sessionServiceMock.commit).not.toHaveBeenCalled();
    });

    it('should set silent authentication flag to true, commit session, validate session and call overrideAuthorizePrompt when user is connected (for prompt "none")', async () => {
      // Arrange: simulate prompt 'none' which makes isPromptStrictlyEqualNone return true
      ctx.prompt = 'none';
      getAuthorizationParametersSpy.mockReturnValue({ prompt: 'none' });
      isPromptStrictlyEqualNoneSpy.mockReturnValue(true);
      sessionServiceMock.get.mockReturnValue({ some: 'data' });
      // Simulate validateDto returns an empty array: user is connected
      validateDtoMock.mockResolvedValueOnce([]);

      // Act
      await service['handleSilentAuthenticationMiddleware'](ctx);

      // Assert
      expect(isPromptStrictlyEqualNoneSpy).toHaveBeenCalledWith('none');
      expect(sessionServiceMock.set).toHaveBeenCalledWith(
        'User',
        'isSilentAuthentication',
        true,
      );
      expect(sessionServiceMock.commit).toHaveBeenCalledTimes(1);
      expect(validateDtoMock).toHaveBeenCalledWith(
        sessionServiceMock.get('User') as object,
        ActiveUserSessionDto,
        {},
      );
      // Since user is connected and prompt equals 'none', override should be called
      expect(overrideAuthorizePromptSpy).toHaveBeenCalledWith(ctx);
    });

    it('should set silent authentication flag to true, commit session, validate session and NOT call overrideAuthorizePrompt when user is not connected (for prompt "none")', async () => {
      // Arrange: prompt 'none' with isPromptStrictlyEqualNone true
      ctx.prompt = 'none';
      getAuthorizationParametersSpy.mockReturnValue({ prompt: 'none' });
      isPromptStrictlyEqualNoneSpy.mockReturnValue(true);
      sessionServiceMock.get.mockReturnValue({ some: 'data' });
      // Simulate validateDto returns a non-empty array: user is not connected
      validateDtoMock.mockResolvedValueOnce([new Error('Not connected')]);

      // Act
      await service['handleSilentAuthenticationMiddleware'](ctx);

      // Assert
      expect(isPromptStrictlyEqualNoneSpy).toHaveBeenCalledWith('none');
      expect(sessionServiceMock.set).toHaveBeenCalledWith(
        'User',
        'isSilentAuthentication',
        true,
      );
      expect(sessionServiceMock.commit).toHaveBeenCalledTimes(1);
      expect(validateDtoMock).toHaveBeenCalledWith(
        sessionServiceMock.get('User') as object,
        ActiveUserSessionDto,
        {},
      );
      // Since user is not connected, overrideAuthorizePrompt should NOT be called
      expect(overrideAuthorizePromptSpy).not.toHaveBeenCalled();
    });

    it('should set silent authentication flag to false, commit session, validate session and not call overrideAuthorizePrompt when prompt is not "none"', async () => {
      // Arrange: simulate a prompt value other than 'none' (e.g. 'login')
      ctx.prompt = 'login';
      getAuthorizationParametersSpy.mockReturnValue({ prompt: 'login' });
      isPromptStrictlyEqualNoneSpy.mockReturnValue(false);
      sessionServiceMock.get.mockReturnValue({ some: 'data' });
      // Simulate validateDto returns an empty array (user connected) but flag is false
      validateDtoMock.mockResolvedValueOnce([]);

      // Act
      await service['handleSilentAuthenticationMiddleware'](ctx);

      // Assert
      expect(isPromptStrictlyEqualNoneSpy).toHaveBeenCalledWith('login');
      expect(sessionServiceMock.set).toHaveBeenCalledWith(
        'User',
        'isSilentAuthentication',
        false,
      );
      expect(sessionServiceMock.commit).toHaveBeenCalledTimes(1);
      expect(validateDtoMock).toHaveBeenCalledWith(
        sessionServiceMock.get('User') as object,
        ActiveUserSessionDto,
        {},
      );
      // Since isPromptStrictlyEqualNone returned false, overrideAuthorizePrompt should NOT be called
      expect(overrideAuthorizePromptSpy).not.toHaveBeenCalled();
    });
  });

  describe('isPromptStrictlyEqualNone()', () => {
    const values = [
      { expected: true, value: 'none' },
      { expected: false, value: 'none consent' },
      { expected: false, value: 'consent login none' },
      { expected: false, value: 'consent login' },
      { expected: false, value: undefined },
      { expected: false, value: '' },
      { expected: false, value: null },
    ];
    it.each(values)(
      'should returns %s for input "%s"',
      ({ value, expected }) => {
        expect(service['isPromptStrictlyEqualNone'](value)).toBe(expected);
      },
    );
  });
});
