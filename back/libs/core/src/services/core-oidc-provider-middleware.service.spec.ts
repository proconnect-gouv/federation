import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { throwException } from '@fc/exceptions/helpers';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { atHashFromAccessToken } from '@fc/oidc';
import { OidcAcrService } from '@fc/oidc-acr';
import { IDENTITY_PROVIDER_SERVICE } from '@fc/oidc-client/tokens';
import {
  OidcCtx,
  OidcProviderErrorService,
  OidcProviderMiddlewarePattern,
  OidcProviderMiddlewareStep,
  OidcProviderService,
} from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { SessionNoSessionIdException, SessionService } from '@fc/session';
import { TrackedEventContextInterface, TrackingService } from '@fc/tracking';

import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { CoreClaimAmrException } from '../exceptions';
import { CORE_SERVICE } from '../tokens';
import { CoreOidcProviderMiddlewareService } from './core-oidc-provider-middleware.service';

jest.mock('@fc/oidc');

jest.mock('@fc/exceptions/helpers', () => ({
  ...jest.requireActual('@fc/exceptions/helpers'),
  throwException: jest.fn(),
}));

describe('CoreOidcProviderMiddlewareService', () => {
  let service: CoreOidcProviderMiddlewareService;
  const throwExceptionMock = jest.mocked(throwException);

  const loggerServiceMock = getLoggerMock();

  const sessionServiceMock = getSessionServiceMock();

  const atHashFromAccessTokenMock = jest.mocked(atHashFromAccessToken);

  const oidcProviderServiceMock = {
    getInteractionIdFromCtx: jest.fn(),
    registerMiddleware: jest.fn(),
    clearCookies: jest.fn(),
  };

  const serviceProviderServiceMock = {
    getById: jest.fn(),
    getList: jest.fn(),
  };

  const trackingMock = {
    track: jest.fn(),
    TrackedEventsMap: {
      FC_AUTHORIZE_INITIATED: {},
      SP_REQUESTED_FC_TOKEN: {},
      SP_REQUESTED_FC_USERINFO: {},
      FC_SSO_INITIATED: {},
      FC_REDIRECTED_TO_HINTED_IDP: {},
    },
  };

  const interactionIdValueMock = '42';
  const eventContextMock = {
    fc: {
      interactionId: interactionIdValueMock,
    },
    sessionId: 'session-id-mock',
  };
  const oidcProviderErrorServiceMock = {
    throwError: jest.fn(),
    handleRedirectableError: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const atHashMock = 'atHashMock value';
  const sessionIdMock = 'session-id-mock';
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
    sessionId: sessionIdMock,
    query: { acr_values: spAcrMock, client_id: spIdMock },
  };
  const resMock = {
    redirect: jest.fn(),
  };

  const coreServiceMock = {
    redirectToIdp: jest.fn(),
  };

  const identityProviderAdapterMock = {
    getById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreOidcProviderMiddlewareService,
        LoggerService,
        SessionService,
        OidcProviderService,
        TrackingService,
        ConfigService,
        OidcAcrService,
        ServiceProviderAdapterMongoService,
        OidcProviderErrorService,
        {
          provide: CORE_SERVICE,
          useValue: coreServiceMock,
        },
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useValue: identityProviderAdapterMock,
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
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderAdapterMock)
      .compile();

    service = module.get<CoreOidcProviderMiddlewareService>(
      CoreOidcProviderMiddlewareService,
    );

    atHashFromAccessTokenMock.mockReturnValue(atHashMock);

    sessionServiceMock.initCache.mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerMiddleware', () => {
    const stepMock = Symbol(
      'stepMock',
    ) as unknown as OidcProviderMiddlewareStep;
    const patternMock = Symbol(
      'middlewareMock',
    ) as unknown as OidcProviderMiddlewarePattern;
    const middlewareMock = function test() {};

    it('should call oidcProviderService.registerMiddleware()', () => {
      // When
      service['registerMiddleware'](stepMock, patternMock, middlewareMock);

      // Then
      expect(oidcProviderServiceMock.registerMiddleware).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcProviderServiceMock.registerMiddleware).toHaveBeenCalledWith(
        stepMock,
        patternMock,
        expect.any(Function),
      );
    });
  });

  describe('getEventContext', () => {
    const interactionIdMock = 'interactionIdMockValue';
    const netWorkInfoMock = {
      ip: 'ip',
      originalAddresses: 'originalAddresses',
      port: 'port',
    };
    beforeEach(() => {
      oidcProviderServiceMock.getInteractionIdFromCtx.mockReturnValueOnce(
        interactionIdMock,
      );
      service['getNetworkInfoFromHeaders'] = jest
        .fn()
        .mockReturnValueOnce(netWorkInfoMock);
    });

    it('should return context object with sessionId from `req` if no oidc accountId', () => {
      // Given
      const ctxMock = {
        req: {
          sessionId: 'sessionIdValue',
        },
      };
      // When
      const result = service['getEventContext'](ctxMock);
      // Then
      expect(result).toEqual({
        fc: {
          interactionId: interactionIdMock,
        },
        req: ctxMock.req,
        sessionId: ctxMock.req.sessionId,
      });
    });

    it('should return context object with sessionId from `oidc` object', () => {
      // Given
      const ctxMock = {
        req: {
          sessionId: 'sessionIdValue',
        },
        oidc: {
          entities: {
            Account: {
              accountId: 'accountIdMock',
            },
          },
        },
      };
      // When
      const result = service['getEventContext'](ctxMock);
      // Then
      expect(result).toEqual({
        fc: {
          interactionId: interactionIdMock,
        },
        req: ctxMock.req,
        sessionId: ctxMock.oidc.entities.Account.accountId,
      });
    });

    it('should return context object with sessionId from ̀`req` if `oidc` object is incomplete', () => {
      // Given
      const ctxMock = {
        req: {
          sessionId: 'sessionIdValue',
        },
        oidc: {
          entities: {},
        },
      };
      // When
      const result = service['getEventContext'](ctxMock);
      // Then
      expect(result).toEqual({
        fc: {
          interactionId: interactionIdMock,
        },
        req: ctxMock.req,
        sessionId: ctxMock.req.sessionId,
      });
    });
  });

  describe('getAuthorizationParameters', () => {
    it('should return request body when method is POST', () => {
      // Given
      const ctxMock: any = {
        method: 'POST',
        req: {
          body: { param1: 'value1', param2: 'value2' },
          query: { param3: 'value3', param4: 'value4' },
        },
      };

      // When
      const result = service['getAuthorizationParameters'](ctxMock);

      // Then
      expect(result).toEqual({ param1: 'value1', param2: 'value2' });
    });

    it('should return query parameters when method is not POST', () => {
      // Given
      const ctxMock: any = {
        method: 'GET',
        req: {
          body: { param1: 'value1', param2: 'value2' },
          query: { param3: 'value3', param4: 'value4' },
        },
      };

      // When
      const result = service['getAuthorizationParameters'](ctxMock);

      // Then
      expect(result).toEqual({ param3: 'value3', param4: 'value4' });
    });

    it('should return empty object when method is POST and request body is empty', () => {
      // Given
      const ctxMock: any = {
        method: 'POST',
        req: { body: {}, query: { param3: 'value3', param4: 'value4' } },
      };

      // When
      const result = service['getAuthorizationParameters'](ctxMock);

      // Then
      expect(result).toEqual({});
    });

    it('should return empty object when method is not POST and query parameters are empty', () => {
      // Arrange
      const ctxMock: any = {
        method: 'GET',
        req: { body: { param1: 'value1', param2: 'value2' }, query: {} },
      };

      // When
      const result = service['getAuthorizationParameters'](ctxMock);

      // Then
      expect(result).toEqual({});
    });
  });

  describe('beforeAuthorizeMiddleware', () => {
    it('should set cookies to nothing if cookies do not exist', () => {
      // Given
      const ctxMock: any = {
        req: { headers: { foo: 'bar' } },
      };

      // When
      service['beforeAuthorizeMiddleware'](ctxMock);

      // Then
      expect(ctxMock).toEqual({
        req: { headers: { foo: 'bar', cookie: '' } },
      });
    });

    it('should set cookies to nothing if cookies exist', () => {
      // Given
      const ctxMock: any = {
        req: {
          headers: {
            cookie: {
              _interaction: '123',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              session_id: 'test',
            },
          },
        },
      };

      // When
      service['beforeAuthorizeMiddleware'](ctxMock);

      // Then
      expect(ctxMock).toEqual({
        req: { headers: { cookie: '' } },
      });
    });
  });

  describe('overrideClaimAmrMiddleware()', () => {
    it('should throw an error if service provider not authorized to request amr claim', async () => {
      // Given
      const ctxMock = {
        oidc: {
          params: { acr_values: spAcrMock, client_id: spIdMock },
          claims: { id_token: { amr: { essential: true } } },
        },
        req: reqMock,
        res: resMock,
      };

      serviceProviderServiceMock.getById.mockResolvedValueOnce({
        claims: [],
      });

      // When
      await expect(
        service['overrideClaimAmrMiddleware'](ctxMock),
      ).rejects.toThrow(CoreClaimAmrException);

      // Then
      expect(serviceProviderServiceMock.getById).toHaveBeenCalledTimes(1);
      expect(serviceProviderServiceMock.getById).toHaveBeenCalledWith(spIdMock);
    });

    it('should not throw if amr claim not requested and not authorized for sp', async () => {
      // Given
      const ctxMock = {
        oidc: {
          params: { acr_values: spAcrMock, client_id: spIdMock },
          claims: {},
        },
        req: reqMock,
        res: resMock,
      };
      serviceProviderServiceMock.getById.mockResolvedValueOnce({
        claims: [],
      });

      // When
      await service['overrideClaimAmrMiddleware'](ctxMock);

      // Then
      expect(serviceProviderServiceMock.getById).toHaveBeenCalledTimes(0);
      expect(oidcProviderErrorServiceMock.throwError).toHaveBeenCalledTimes(0);
    });

    it('should not throw if amr claim not requested by service provider but authorized for sp', async () => {
      // Given
      const ctxMock = {
        oidc: {
          params: { acr_values: spAcrMock, client_id: spIdMock },
          claims: {},
        },
        req: reqMock,
        res: resMock,
      };
      serviceProviderServiceMock.getById.mockResolvedValueOnce({
        claims: ['amr'],
      });

      // When
      await service['overrideClaimAmrMiddleware'](ctxMock);

      // Then
      expect(serviceProviderServiceMock.getById).toHaveBeenCalledTimes(0);
      expect(oidcProviderErrorServiceMock.throwError).toHaveBeenCalledTimes(0);
    });

    it('should not throw if amr claim is authorized to request by the service provider', async () => {
      // Given
      const ctxMock = {
        oidc: {
          params: { acr_values: spAcrMock, client_id: spIdMock },
          claims: { id_token: { amr: { essential: true } } },
        },
        req: reqMock,
        res: resMock,
      };
      serviceProviderServiceMock.getById.mockResolvedValueOnce({
        claims: ['amr'],
      });

      // When
      await service['overrideClaimAmrMiddleware'](ctxMock);

      // Then
      expect(serviceProviderServiceMock.getById).toHaveBeenCalledTimes(1);
      expect(serviceProviderServiceMock.getById).toHaveBeenCalledWith(spIdMock);

      expect(oidcProviderErrorServiceMock.throwError).toHaveBeenCalledTimes(0);
    });
  });

  describe('overrideAuthorizePrompt()', () => {
    it('should set prompt parameter on query', () => {
      // Given
      const ctxMock = {
        method: 'GET',
        query: {},
      } as OidcCtx;
      const overridePrompt = 'test';
      configServiceMock.get.mockReturnValue({
        forcedPrompt: ['test'],
      });
      // When
      service['overrideAuthorizePrompt'](ctxMock);
      // Then
      expect(ctxMock.query.prompt).toBe(overridePrompt);
      expect(ctxMock.body).toBeUndefined();
    });

    it('should set prompt parameter on body', () => {
      // Given
      const ctxMock: OidcCtx = {
        method: 'POST',
        req: { body: {} },
      } as unknown as OidcCtx;
      const overridePrompt = 'test';
      configServiceMock.get.mockReturnValue({
        forcedPrompt: ['test'],
      });
      // When
      service['overrideAuthorizePrompt'](ctxMock);
      // Then
      expect(ctxMock.req.body.prompt).toBe(overridePrompt);
      expect(ctxMock.query).toBeUndefined();
    });

    it('should not do anything but log if method is not handled', () => {
      // Given
      const ctxMock = { method: 'DELETE' } as OidcCtx;
      configServiceMock.get.mockReturnValue({
        forcedPrompt: ['login'],
      });
      // When
      service['overrideAuthorizePrompt'](ctxMock);
      // Then
      expect(ctxMock).toEqual({ method: 'DELETE' });
    });
  });

  describe('tokenMiddleware()', () => {
    // Given
    const eventCtxMock: TrackedEventContextInterface = {
      fc: { interactionId: interactionIdValueMock },
      headers: {
        'x-forwarded-for': '123.123.123.123',
        'x-forwarded-source-port': '443',
        'x-forwarded-for-original': '123.123.123.123,124.124.124.124',
      },
    };
    const ctxMock = {
      req: {
        headers: {
          'x-forwarded-for': '123.123.123.123',
          'x-forwarded-source-port': '443',
          'x-forwarded-for-original': '123.123.123.123,124.124.124.124',
        },
        query: { acr_values: 'eidas3', client_id: 'foo' },
      },
      res: {},
      oidc: {
        entities: {},
      },
    } as unknown as OidcCtx;

    beforeEach(() => {
      service['getSessionId'] = jest.fn().mockReturnValue(sessionIdMock);
    });

    it('should create a session alias based on at_hash', async () => {
      // Given
      service['getEventContext'] = jest
        .fn()
        .mockReturnValue(eventCtxMock as TrackedEventContextInterface);

      serviceProviderServiceMock.getById.mockResolvedValueOnce({
        name: 'name',
      });

      // When
      await service['tokenMiddleware'](ctxMock);

      // Then
      expect(sessionServiceMock.setAlias).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.setAlias).toHaveBeenCalledWith(
        atHashMock,
        sessionIdMock,
      );
    });

    it('should publish a token event', async () => {
      // Given
      service['getEventContext'] = jest
        .fn()
        .mockReturnValue(eventCtxMock as TrackedEventContextInterface);

      serviceProviderServiceMock.getById.mockResolvedValueOnce({
        name: 'name',
      });
      // When
      await service['tokenMiddleware'](ctxMock);
      // Then
      expect(trackingMock.track).toHaveBeenCalledTimes(1);
      expect(service['getEventContext']).toHaveBeenCalledTimes(1);
      expect(service['getEventContext']).toHaveBeenLastCalledWith(ctxMock);
      expect(trackingMock.track).toHaveBeenCalledWith(
        trackingMock.TrackedEventsMap.SP_REQUESTED_FC_TOKEN,
        eventCtxMock,
      );
    });
  });

  describe('userinfoMiddleware()', () => {
    beforeEach(() => {
      service['getEventContext'] = jest.fn().mockReturnValue(eventContextMock);
    });

    it('should publish a userinfo event', async () => {
      // Given
      const ctxMock = {
        req: {
          headers: { 'x-forwarded-for': '123.123.123.123' },
          query: { acr_values: 'eidas3', client_id: 'foo' },
        },
        res: {},
      };

      // When
      await service['userinfoMiddleware'](ctxMock);
      // Then
      expect(trackingMock.track).toHaveBeenCalledTimes(1);
      expect(trackingMock.track).toHaveBeenCalledWith(
        trackingMock.TrackedEventsMap.SP_REQUESTED_FC_USERINFO,
        eventContextMock,
      );
    });
  });

  describe('getSessionId()', () => {
    beforeEach(() => {
      service['getEventContext'] = jest.fn().mockReturnValue(eventContextMock);
    });

    it('should return the session id', () => {
      // Given
      const ctxMock = {} as unknown as OidcCtx;
      // When
      const result = service['getSessionId'](ctxMock);
      // Then
      expect(result).toBe(eventContextMock.sessionId);
    });

    it('should throw an error if session is not defined', () => {
      // Given
      const ctxMock = {} as unknown as OidcCtx;
      service['getEventContext'] = jest.fn().mockReturnValueOnce(ctxMock);

      // Then / When
      expect(() => service['getSessionId'](ctxMock)).toThrow(
        SessionNoSessionIdException,
      );
    });
  });

  describe('koaErrorCatcherMiddlewareFactory()', () => {
    it('should execute the middleware successfully without any error', async () => {
      // Given
      const ctxMock = { oidc: {} } as any;
      const middleware = jest.fn().mockResolvedValue(undefined);
      const errorCatcherMiddleware =
        service['koaErrorCatcherMiddlewareFactory'](middleware);

      // When
      await errorCatcherMiddleware(ctxMock);

      // Then
      expect(ctxMock.oidc.isError).toBeUndefined();
      expect(middleware).toHaveBeenCalledWith(ctxMock);
    });

    it('should handle errors, set isError to true, and call throwException', async () => {
      // Given
      const ctxMock = { oidc: {} } as any;
      const error = new Error('middleware error');
      const middleware = jest.fn().mockRejectedValue(error);
      const errorCatcherMiddleware =
        service['koaErrorCatcherMiddlewareFactory'](middleware);

      // When
      await errorCatcherMiddleware(ctxMock);

      // Then
      expect(ctxMock.oidc.isError).toBe(true);
      expect(throwExceptionMock).toHaveBeenCalledWith(error);
    });
  });
});
