import { ValidationError } from 'class-validator';

import { Test, TestingModule } from '@nestjs/testing';

import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import { CORE_SERVICE, CoreIdpHintException } from '@fc/core';
import { CoreFcaService } from '@fc/core-fca';
import { FlowStepsService } from '@fc/flow-steps';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { IdentityProviderMetadata } from '@fc/oidc';
import { OidcAcrService } from '@fc/oidc-acr';
import { IDENTITY_PROVIDER_SERVICE } from '@fc/oidc-client/tokens';
import {
  OidcCtx,
  OidcProviderErrorService,
  OidcProviderService,
} from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { Session, SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { GetAuthorizeCoreSessionDto, GetAuthorizeSessionDto } from '../dto';
import { CoreFcaMiddlewareService } from './core-fca-middleware.service';

jest.mock('@fc/common', () => ({
  ...jest.requireActual('@fc/common'),
  validateDto: jest.fn(),
}));

describe('CoreFcaMiddlewareService', () => {
  let service: CoreFcaMiddlewareService;

  const loggerServiceMock = getLoggerMock();

  const oidcProviderServiceMock = {
    registerMiddleware: jest.fn(),
    getInteractionIdFromCtx: jest.fn(),
  };

  const sessionServiceMock = getSessionServiceMock();

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

  const oidcAcrServiceMock = {
    getKnownAcrValues: jest.fn(),
  };

  const spIdentityMock = {
    email: 'eteach@fqdn.ext',
    family_name: 'TEACH',
    given_name: 'Edward',
    sub: '42',
  };

  const idpIdentityMock = {
    sub: 'some idpSub',
  };

  const sessionDataMock: Session = {
    idpAcr: 'eidas3',
    idpId: '42',
    idpIdentity: idpIdentityMock,
    idpName: 'my favorite Idp',
    idpLabel: 'my favorite Idp Title',
    spAcr: 'eidas3',
    spId: 'sp_id',
    spIdentity: spIdentityMock,
    spName: 'my great SP',
  };

  const sessionIdMockValue = '42';
  const spAcrMock = 'eidas3';
  const spIdMock = 'spIdValue';
  const ipMock = '123.123.123.123';
  const sourcePortMock = '443';
  const xForwardedForOriginalMock = '123.123.123.123,124.124.124.124';
  const reqMock = {
    headers: {
      'x-forwarded-for': ipMock,
      'x-forwarded-source-port': sourcePortMock,
      'x-forwarded-for-original': xForwardedForOriginalMock,
    },
    sessionId: sessionIdMockValue,
    query: { acr_values: spAcrMock, client_id: spIdMock },
  };
  const resMock = {
    redirect: jest.fn(),
  };

  const coreFcaServiceMock = {};

  const FlowStepsServiceMock = {};

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

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
          provide: CORE_SERVICE,
          useValue: coreFcaServiceMock,
        },
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useValue: {},
        },
        FlowStepsService,
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
      .overrideProvider(FlowStepsService)
      .useValue(FlowStepsServiceMock)
      .compile();

    service = module.get<CoreFcaMiddlewareService>(CoreFcaMiddlewareService);

    sessionServiceMock.get.mockReturnValue(sessionDataMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit()', () => {
    it('should register 6 middlewares', () => {
      // Given
      service['registerMiddleware'] = jest.fn();
      // When
      service.onModuleInit();
      // Then
      expect(service['registerMiddleware']).toHaveBeenCalledTimes(6);
    });
  });

  describe('handleSilentAuthenticationMiddleware()', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should override prompt with default values when prompt is undefined', async () => {
      // Given
      const ctxMock: any = {
        acr_values: ['acr1', 'acr2'],
      };
      const mockOverrideAuthorizePrompt = (service[
        'getAuthorizationParameters'
      ] = jest.fn().mockReturnValue(ctxMock));

      sessionServiceMock['get'] = jest.fn();
      service['isPromptStrictlyEqualNone'] = jest.fn();
      service['overrideAuthorizePrompt'] = mockOverrideAuthorizePrompt;

      // When
      await service['handleSilentAuthenticationMiddleware'](ctxMock);

      // Then
      expect(mockOverrideAuthorizePrompt).toHaveBeenCalledWith(ctxMock);

      expect(sessionServiceMock['get']).not.toHaveBeenCalled();
      expect(service['isPromptStrictlyEqualNone']).not.toHaveBeenCalled();
      expect(sessionServiceMock.set).not.toHaveBeenCalled();
    });

    it('should override prompt with default values when SSO is available and prompt is "none"', async () => {
      // Given
      const ctxMock: any = {
        acr_values: ['acr1', 'acr2'],
        prompt: 'none',
      };
      const mockOverrideAuthorizePrompt = jest.fn();
      service['getAuthorizationParameters'] = jest
        .fn()
        .mockReturnValue(ctxMock);
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: { sub: 'subValue' },
      });
      service['isPromptStrictlyEqualNone'] = jest.fn().mockReturnValue(true);
      service['overrideAuthorizePrompt'] = mockOverrideAuthorizePrompt;

      // When
      await service['handleSilentAuthenticationMiddleware'](ctxMock);

      // Then
      expect(mockOverrideAuthorizePrompt).toHaveBeenCalledWith(ctxMock);
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith(
        'OidcClient',
        'isSilentAuthentication',
        true,
      );
    });

    it('should not override prompt values when SSO is not available', async () => {
      // Given
      const ctxMock: any = {
        acr_values: ['acr1', 'acr2'],
        prompt: 'none',
      };
      const mockOverrideAuthorizePrompt = jest.fn();
      service['getAuthorizationParameters'] = jest
        .fn()
        .mockReturnValue(ctxMock);
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: null,
      });
      service['isPromptStrictlyEqualNone'] = jest.fn().mockReturnValue(true);
      service['overrideAuthorizePrompt'] = mockOverrideAuthorizePrompt;

      // When
      await service['handleSilentAuthenticationMiddleware'](ctxMock);

      // Then
      expect(mockOverrideAuthorizePrompt).not.toHaveBeenCalled();
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith(
        'OidcClient',
        'isSilentAuthentication',
        true,
      );
    });

    it('should not override prompt values when prompt does not include "none"', async () => {
      // Given
      const ctxMock: any = {
        acr_values: ['acr1', 'acr2'],
        prompt: 'login',
      };
      const mockOverrideAuthorizePrompt = jest.fn();
      service['getAuthorizationParameters'] = jest
        .fn()
        .mockReturnValue(ctxMock);
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: { sub: 'subValue' },
      });
      service['isPromptStrictlyEqualNone'] = jest.fn().mockReturnValue(false);
      service['overrideAuthorizePrompt'] = mockOverrideAuthorizePrompt;

      // When
      await service['handleSilentAuthenticationMiddleware'](ctxMock);

      // Then
      expect(mockOverrideAuthorizePrompt).not.toHaveBeenCalled();
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith(
        'OidcClient',
        'isSilentAuthentication',
        false,
      );
    });

    it('should not override prompt values when prompt does not include "none" and SSO is not available', async () => {
      // Given
      const ctxMock: any = {
        acr_values: ['acr1', 'acr2'],
        prompt: 'login',
      };
      const mockOverrideAuthorizePrompt = jest.fn();
      service['getAuthorizationParameters'] = jest
        .fn()
        .mockReturnValue(ctxMock);
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: null,
      });
      service['isPromptStrictlyEqualNone'] = jest.fn().mockReturnValue(false);
      service['overrideAuthorizePrompt'] = mockOverrideAuthorizePrompt;

      // When
      await service['handleSilentAuthenticationMiddleware'](ctxMock);

      // Then
      expect(mockOverrideAuthorizePrompt).not.toHaveBeenCalled();
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith(
        'OidcClient',
        'isSilentAuthentication',
        false,
      );
    });

    it('should not override prompt values when "none" is not the single prompt value', async () => {
      // Given
      const ctxMock: any = {
        acr_values: ['acr1', 'acr2'],
        prompt: 'login none',
      };
      const mockOverrideAuthorizePrompt = jest.fn();
      service['getAuthorizationParameters'] = jest
        .fn()
        .mockReturnValue(ctxMock);
      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: { sub: 'subValue' },
      });
      service['isPromptStrictlyEqualNone'] = jest.fn().mockReturnValue(false);
      service['overrideAuthorizePrompt'] = mockOverrideAuthorizePrompt;

      // When
      await service['handleSilentAuthenticationMiddleware'](ctxMock);

      // Then
      expect(mockOverrideAuthorizePrompt).not.toHaveBeenCalled();
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith(
        'OidcClient',
        'isSilentAuthentication',
        false,
      );
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

  describe('afterAuthorizeMiddleware', () => {
    let configMock: ConfigService;
    let loggerServiceMock: LoggerService;
    let service: CoreFcaMiddlewareService;
    let sessionServiceMock: jest.Mocked<SessionService>;
    let identityProviderAdapterMock: jest.Mocked<IdentityProviderAdapterMongoService>;
    let oidcProviderServiceMock: jest.Mocked<OidcProviderService>;
    let serviceProviderMock: jest.Mocked<ServiceProviderAdapterMongoService>;
    let coreFcaServiceMock: jest.Mocked<CoreFcaService>;
    let trackingMock: jest.Mocked<TrackingService>;
    let resMock: OidcCtx['res'];
    let flowStepsServiceMock: jest.Mocked<FlowStepsService>;

    beforeEach(() => {
      sessionServiceMock = {
        get: jest.fn(),
        set: jest.fn(),
        commit: jest.fn(),
        reset: jest.fn(),
        duplicate: jest.fn(),
      } as unknown as jest.Mocked<SessionService>;

      oidcProviderServiceMock = {
        getInteractionIdFromCtx: jest.fn(),
      } as unknown as jest.Mocked<OidcProviderService>;

      serviceProviderMock = {
        getById: jest.fn(),
      } as unknown as jest.Mocked<ServiceProviderAdapterMongoService>;

      trackingMock = {
        track: jest.fn(),
        TrackedEventsMap: {
          FC_AUTHORIZE_INITIATED: {},
          FC_SSO_INITIATED: {},
        },
      } as unknown as jest.Mocked<TrackingService>;

      resMock = {
        redirect: jest.fn(),
      } as unknown as OidcCtx['res'];

      loggerServiceMock = {
        debug: jest.fn(),
        info: jest.fn(),
      } as unknown as LoggerService;

      configMock = {
        get: jest.fn().mockReturnValueOnce({ urlPrefix: '' }),
      } as unknown as ConfigService;

      coreFcaServiceMock = {
        redirectToIdp: jest.fn(),
      } as unknown as jest.Mocked<CoreFcaService>;

      flowStepsServiceMock = {
        setStep: jest.fn(),
      } as unknown as jest.Mocked<FlowStepsService>;

      identityProviderAdapterMock = {
        getById: jest.fn(),
      } as unknown as jest.Mocked<IdentityProviderAdapterMongoService>;

      service = new CoreFcaMiddlewareService(
        loggerServiceMock,
        configMock,
        oidcProviderServiceMock,
        sessionServiceMock,
        serviceProviderMock,
        trackingMock,
        {} as OidcProviderErrorService,
        {} as OidcAcrService,
        coreFcaServiceMock,
        flowStepsServiceMock,
        identityProviderAdapterMock,
      );
    });

    it('should initialize session and track authorization', async () => {
      // Setup mocks
      const ctxMock: OidcCtx = {
        oidc: {
          params: {
            acr_values: 'eidas3',
            client_id: 'spIdValue',
            redirect_uri: 'http://example.com',
            state: 'state_value',
          },
        },
        req: {} as any,
        res: { ...resMock, redirect: jest.fn() },
      } as unknown as OidcCtx;

      const eventContextMock = {
        fc: { interactionId: 'interactionId' },
      };

      service['getEventContext'] = jest.fn().mockReturnValue(eventContextMock);
      service['renewSession'] = jest.fn();
      serviceProviderMock.getById.mockResolvedValueOnce({
        name: 'SP Name',
        active: true,
        entityId: 'entityIdValue',
      });

      sessionServiceMock.get.mockReturnValueOnce({ spIdentity: {} });

      // Act
      await service['afterAuthorizeMiddleware'](ctxMock);

      // Assert
      expect(service['renewSession']).toHaveBeenCalledWith(ctxMock);
      expect(sessionServiceMock.set).toHaveBeenCalledWith('OidcClient', {
        browsingSessionId: expect.any(String),
        interactionId: 'interactionId',
        reusesActiveSession: false,
        spAcr: 'eidas3',
        spId: 'spIdValue',
        spName: 'SP Name',
        spRedirectUri: 'http://example.com',
        spState: 'state_value',
        stepRoute: '/authorize',
      });
      expect(sessionServiceMock.commit).toHaveBeenCalledTimes(1);
      expect(trackingMock.track).toHaveBeenCalledWith(
        trackingMock.TrackedEventsMap.FC_AUTHORIZE_INITIATED,
        eventContextMock,
      );
    });

    it('should redirect to interaction verify URL when user is already connected', async () => {
      // Setup mocks
      const ctxMock: OidcCtx = {
        oidc: {
          params: {
            acr_values: 'eidas3',
          },
        },
        req: {} as any,
        res: resMock,
      } as unknown as OidcCtx;

      const eventContextMock = {
        fc: { interactionId: 'interactionId' },
      };

      service['getEventContext'] = jest.fn().mockReturnValue(eventContextMock);
      service['renewSession'] = jest.fn();
      serviceProviderMock.getById.mockResolvedValueOnce({
        name: 'SP Name',
        active: true,
        entityId: 'entityIdValue',
      });

      sessionServiceMock.get.mockReturnValueOnce({
        spIdentity: { sub: 'subValue' },
      });
      oidcProviderServiceMock.getInteractionIdFromCtx.mockReturnValueOnce(
        'interactionId',
      );

      // Act
      await service.afterAuthorizeMiddleware(ctxMock);

      // Assert
      expect(resMock.redirect).toHaveBeenCalledWith(
        '/interaction/interactionId/verify',
      );
    });

    it('should not redirect and just commit the session when user is not connected', async () => {
      // Setup mocks
      const ctxMock = {
        oidc: {
          params: {
            acr_values: 'eidas3',
          },
        },
        req: {} as any,
        res: resMock,
      } as unknown as OidcCtx;

      const eventContextMock = {
        fc: { interactionId: 'interactionId' },
      };

      service['getEventContext'] = jest.fn().mockReturnValue(eventContextMock);
      service['renewSession'] = jest.fn();
      serviceProviderMock.getById.mockResolvedValueOnce({
        name: 'SP Name',
        active: true,
        entityId: 'entityIdValue',
      });

      sessionServiceMock.get.mockReturnValueOnce({});

      // Act
      await service.afterAuthorizeMiddleware(ctxMock);

      // Assert
      expect(resMock.redirect).not.toHaveBeenCalled();
      expect(sessionServiceMock.commit).toHaveBeenCalledTimes(1);
    });

    it('should throw CoreIdpHintException if idpHint is invalid', async () => {
      // Setup
      const ctxMock: OidcCtx = {
        req: {} as any,
        res: resMock,
        oidc: {
          params: { idp_hint: 'invalidIdp' },
        },
      } as unknown as OidcCtx;

      identityProviderAdapterMock.getById.mockResolvedValueOnce(null);

      await expect(service.afterAuthorizeMiddleware(ctxMock)).rejects.toThrow(
        CoreIdpHintException,
      );
      expect(identityProviderAdapterMock.getById).toHaveBeenCalledWith(
        'invalidIdp',
      );
    });

    it('should redirect to idp when user idp_hint is provided', async () => {
      // Setup
      const ctxMock: OidcCtx = {
        req: {} as any,
        res: resMock,
        oidc: {
          params: {
            acr_values: 'eidas3',
            idp_hint: 'uidValue',
          },
        },
      } as unknown as OidcCtx;

      const hintedIdentityProviderMock = {
        uid: 'uidValue',
      } as unknown as IdentityProviderMetadata;

      identityProviderAdapterMock.getById.mockResolvedValueOnce(
        hintedIdentityProviderMock,
      );
      serviceProviderMock.getById.mockResolvedValueOnce({
        name: 'SP Name',
        active: true,
        entityId: 'entityIdValue',
      });

      // Act
      await service.afterAuthorizeMiddleware(ctxMock);

      // Assert
      expect(coreFcaServiceMock.redirectToIdp).toHaveBeenCalledTimes(1);
      expect(coreFcaServiceMock.redirectToIdp).toHaveBeenCalledWith(
        ctxMock.res,
        'uidValue',
        { acr_values: 'eidas3' },
      );
    });
  });

  describe('isSessionValid', () => {
    // Given
    const validateDtoMock = jest.mocked(validateDto);
    const validationWithErrorsMock = [
      Symbol('error'),
    ] as unknown as ValidationError[];

    const validationWithoutErrorsMock = [
      Symbol('error'),
    ] as unknown as ValidationError[];
    beforeEach(() => {
      validateDtoMock.mockResolvedValueOnce(validationWithoutErrorsMock);
    });

    it('should call session.get() with the sessionService', async () => {
      // When
      await service['isSessionValid']();
      // Then
      expect(sessionServiceMock.get).toHaveBeenCalledTimes(1);
    });

    it('should skip DTO validation if sessionService returns undefined', async () => {
      // Given
      sessionServiceMock.get.mockReset().mockReturnValueOnce(undefined);

      // When
      await service['isSessionValid']();

      // Then
      expect(validateDtoMock).not.toHaveBeenCalled();
    });

    it('should return false if sessionService returns undefined', async () => {
      // Given
      sessionServiceMock.get.mockReset().mockReturnValueOnce(undefined);

      // When
      const result = await service['isSessionValid']();

      // Then
      expect(result).toBe(false);
    });

    it('should call validateDto() with the data from session', async () => {
      // Given
      const sessionDataMock = Symbol('sessionData');
      sessionServiceMock.get.mockReturnValueOnce(sessionDataMock);
      // When
      await service['isSessionValid']();
      // Then
      expect(validateDtoMock).toHaveBeenCalledTimes(1);
      expect(validateDtoMock).toHaveBeenCalledWith(
        sessionDataMock,
        GetAuthorizeSessionDto,
        { forbidNonWhitelisted: true },
      );
    });

    it('should return false if there are validation errors', async () => {
      // Given
      validateDtoMock
        .mockReset()
        .mockResolvedValueOnce(validationWithErrorsMock);

      // When
      const result = await service['isSessionValid']();
      // Then
      expect(result).toBe(false);
    });

    it('should return true if there are no validation errors', async () => {
      // Given
      const validationErrorsMock = [] as unknown as ValidationError[];
      validateDtoMock.mockReset().mockResolvedValueOnce(validationErrorsMock);
      // When
      const result = await service['isSessionValid']();
      // Then
      expect(result).toBe(true);
    });
  });

  describe('renewSession', () => {
    // Given
    const ctxMock = {
      oidc: {
        params: { acr_values: spAcrMock, client_id: spIdMock },
      },
      req: reqMock,
      res: resMock,
    } as unknown as OidcCtx;

    it('should call session.reset() if session is not valid', async () => {
      // Given
      service['isSessionValid'] = jest.fn().mockReturnValue(false);
      // When
      await service['renewSession'](ctxMock);
      // Then
      expect(sessionServiceMock.reset).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.reset).toHaveBeenCalledWith(resMock);
    });

    it('should check if session is SSO compliant with isSessionValid()', async () => {
      // Given
      service['isSessionValid'] = jest.fn().mockReturnValue(true);
      // When
      await service['renewSession'](ctxMock);
      // Then
      expect(service['isSessionValid']).toHaveBeenCalledTimes(1);
      expect(service['isSessionValid']).toHaveBeenCalledWith();
    });

    it('should call sessionService.duplicate if sso is enabled and spIdentity is present', async () => {
      // Given
      service['isSessionValid'] = jest.fn().mockReturnValue(true);
      sessionServiceMock.get.mockReturnValueOnce(true);
      // When
      await service['renewSession'](ctxMock);
      // Then
      expect(sessionServiceMock.duplicate).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.duplicate).toHaveBeenCalledWith(
        resMock,
        GetAuthorizeCoreSessionDto,
      );
    });
  });
});
