import { KoaContextWithOIDC, Provider, ClientMetadata } from 'oidc-provider';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@fc/config';
import { REDIS_CONNECTION_TOKEN } from '@fc/redis';
import { LoggerService, LogLevelNames } from '@fc/logger';
import { FcExceptionFilter } from '@fc/error';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';
import {
  OidcProviderEvents,
  OidcProviderMiddlewareStep,
  OidcProviderMiddlewarePattern,
} from './enums';
import { SERVICE_PROVIDER_SERVICE } from './tokens';
import { OidcProviderService } from './oidc-provider.service';
import {
  OidcProviderInitialisationException,
  OidcProviderBindingException,
  OidcProviderRuntimeException,
  OidcProviderInteractionNotFoundException,
} from './exceptions';
import {
  OidcProviderAuthorizationEvent,
  OidcProviderTokenEvent,
  OidcProviderUserinfoEvent,
} from './events';
import { RedisAdapter } from './adapters';

describe('OidcProviderService', () => {
  let service: OidcProviderService;

  const httpAdapterHostMock = {
    httpAdapter: {
      use: jest.fn(),
    },
  };

  const ProviderProxyMock = class {
    callback() {
      return true;
    }
  } as any;

  const BadProviderProxyMock = class {
    constructor() {
      throw Error('not Working');
    }
  } as any;

  const configServiceMock = {
    get: jest.fn(),
  };
  const redisAdapterMock = class AdapterMock {};
  const configOidcProviderMock = {
    prefix: '/api',
    issuer: 'http://foo.bar',
    configuration: {
      adapter: redisAdapterMock,
      jwks: { keys: [] },
      features: {
        devInteractions: { enabled: false },
      },
      cookies: {
        keys: ['foo'],
      },
    },
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    verbose: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  const serviceProviderListMock = [{ name: 'my SP' }];
  const serviceProviderServiceMock = {
    getList: jest.fn(),
    getById: jest.fn(),
  };

  const sessionServiceMock = {
    init: jest.fn(),
    get: jest.fn(),
  };

  const trackingMock = {
    track: jest.fn(),
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

  const exceptionFilterMock = {
    catch: jest.fn(),
  };

  const unknownError = new Error();

  const redisMock = {
    hgetall: jest.fn(),
    get: jest.fn(),
    multi: jest.fn(),
    hset: jest.fn(),
    ttl: jest.fn(),
    lrange: jest.fn(),
    del: jest.fn(),
  };

  const interactionIdSymbol = Symbol('context#uid');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        LoggerService,
        OidcProviderService,
        HttpAdapterHost,
        FcExceptionFilter,
        SessionService,
        TrackingService,
        {
          provide: SERVICE_PROVIDER_SERVICE,
          useValue: serviceProviderServiceMock,
        },
        {
          provide: REDIS_CONNECTION_TOKEN,
          useValue: redisMock,
        },
      ],
    })
      .overrideProvider(HttpAdapterHost)
      .useValue(httpAdapterHostMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(FcExceptionFilter)
      .useValue(exceptionFilterMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .compile();

    module.useLogger(loggerServiceMock);

    service = module.get<OidcProviderService>(OidcProviderService);
    jest.resetAllMocks();

    configServiceMock.get.mockImplementation((module) => {
      switch (module) {
        case 'OidcProvider':
          return configOidcProviderMock;
        case 'Logger':
          return {
            path: '/dev/null',
            level: LogLevelNames.TRACE,
            isDevelopment: false,
          };
      }
    });

    service['provider'] = providerMock as any;

    serviceProviderServiceMock.getById.mockResolvedValue(
      serviceProviderListMock[0],
    );
    serviceProviderServiceMock.getList.mockResolvedValue(
      serviceProviderListMock,
    );
  });

  describe('onModuleInit', () => {
    beforeEach(() => {
      // Given
      service['getConfig'] = jest.fn().mockResolvedValue({
        ...configOidcProviderMock,
      });
      service['registerMiddlewares'] = jest.fn();
      service['catchErrorEvents'] = jest.fn();
    });
    it('Should create oidc-provider instance', async () => {
      // When
      await service.onModuleInit();
      // Then
      expect(service).toBeDefined();
      // Access to private property via []
      expect(service['provider']).toBeInstanceOf(Provider);
    });

    it('should mount oidc-provider in express', async () => {
      // When
      await service.onModuleInit();
      // Then
      expect(httpAdapterHostMock.httpAdapter.use).toHaveBeenCalledTimes(1);
      /**
       * Sadly we can't test `toHaveBeenCalledWith(service['provider'].callback)`
       * since `̀Provider.callback` is a getter that returns an anonymous function
       */
    });

    it('should throw if provider can not be instantied', async () => {
      // Given
      service['ProviderProxy'] = BadProviderProxyMock;
      // Then
      await expect(service.onModuleInit()).rejects.toThrow(
        OidcProviderInitialisationException,
      );
    });

    it('should throw if provider can not be mounted to server', async () => {
      // Given
      service['ProviderProxy'] = ProviderProxyMock;
      httpAdapterHostMock.httpAdapter.use.mockImplementation(() => {
        throw Error('not working');
      });
      // Then
      await expect(service.onModuleInit()).rejects.toThrow(
        OidcProviderBindingException,
      );
    });
    it('should call several internal initializers', async () => {
      // Given
      service['ProviderProxy'] = ProviderProxyMock;
      // When
      await service.onModuleInit();
      // Then
      expect(service['registerMiddlewares']).toHaveBeenCalledTimes(1);
      expect(service['catchErrorEvents']).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProvider', () => {
    it('Should return the oidc-provider instance', () => {
      // When
      const result = service.getProvider();
      // Then
      expect(result).toBe(service['provider']);
    });
  });

  describe('reloadConfiguration', () => {
    it('Should call getConfig and overrideConfiguration', async () => {
      // Given
      jest.useFakeTimers();
      // Can't use jest.spyOn() on private
      const overrideConfigurationMock = jest.fn();
      const getConfigMock = jest.fn();
      service['overrideConfiguration'] = overrideConfigurationMock;
      service['getConfig'] = getConfigMock;
      // When
      await service['reloadConfiguration']();
      // Then
      expect(getConfigMock).toHaveBeenCalledTimes(1);
      expect(overrideConfigurationMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('overrideConfiguration', () => {
    it('should make the configuration method return fresh data', () => {
      // Given
      const configMock = {
        foo: {
          bar: 'bar value',
        },
      };
      service['provider'] = {} as Provider;
      // When
      service['overrideConfiguration'](configMock);
      const configuration = service['provider']['configuration'];
      const result = configuration('foo.bar');
      // Then
      expect(result).toBe('bar value');
    });

    it('should give the latest version of data', () => {
      // Given
      const newerConfigMock = {
        foo: {
          bar: 'fresh bar value',
        },
      };
      service['provider'] = ({
        configuration: () => 'bar value',
      } as unknown) as Provider;
      // When
      service['overrideConfiguration'](newerConfigMock);
      const result = service['provider']['configuration']('foo.bar');
      // Then
      expect(result).toBe('fresh bar value');
    });
    it('should make the whole config available', () => {
      // Given
      const configMock = {
        foo: {
          bar: 'fresh bar value',
        },
      };
      service['provider'] = {} as Provider;
      // When
      service['overrideConfiguration'](configMock);
      const result = service['provider']['configuration']();
      // Then
      expect(result).toBe(configMock);
    });
  });

  describe('getInteraction', () => {
    it('should return the result of oidc-provider.interactionDetails()', async () => {
      // Given
      const reqMock = {};
      const resMock = {};
      const resolvedValue = Symbol('resolved value');
      providerMock.interactionDetails.mockResolvedValueOnce(resolvedValue);
      // When
      const result = await service.getInteraction(reqMock, resMock);
      // Then
      expect(result).toBe(resolvedValue);
    });
    it('should throw OidcProviderRuntimeException', async () => {
      // Given
      const reqMock = {};
      const resMock = {};
      const nativeError = new Error('invalid_request');
      providerMock.interactionDetails.mockRejectedValueOnce(nativeError);

      await expect(service.getInteraction(reqMock, resMock)).rejects.toThrow(
        OidcProviderRuntimeException,
      );
    });
  });

  describe('finishInteraction', () => {
    // Given
    const reqMock = {
      fc: { interactionId: 'interactiondMockValue' },
    };
    const resMock = {};

    it('should return the result of oidc-provider.interactionFinished()', async () => {
      // Given
      const resolvedValue = Symbol('resolved value');
      providerMock.interactionFinished.mockResolvedValueOnce(resolvedValue);
      sessionServiceMock.get.mockResolvedValueOnce({
        spAcr: 'spAcrValue',
      });
      // When
      const result = await service.finishInteraction(reqMock, resMock);
      // Then
      expect(result).toBe(resolvedValue);
    });
    it('should throw OidcProviderRuntimeException', async () => {
      // Given
      const nativeError = new Error('invalid_request');
      providerMock.interactionFinished.mockRejectedValueOnce(nativeError);
      sessionServiceMock.get.mockResolvedValueOnce({
        spAcr: 'spAcrValue',
      });
      // Then
      await expect(service.finishInteraction(reqMock, resMock)).rejects.toThrow(
        OidcProviderRuntimeException,
      );
    });
  });

  describe('findAccount', () => {
    it('Should return an object with accountID', async () => {
      // Given
      const ctx = { not: 'altered' };
      const sub = 'foo';
      const identityMock = { foo: 'bar' };
      sessionServiceMock.get.mockResolvedValueOnce({
        spIdentity: identityMock,
      });
      // When
      const result = await service['findAccount'](ctx, sub);
      // Then
      expect(result).toHaveProperty('accountId');
      expect(result.accountId).toBe('foo');
      expect(ctx).toEqual({ not: 'altered' });
    });
    it('Should return an object with a claims function that returns identity', async () => {
      // Given
      const ctx = { not: 'altered' };
      const sub = 'foo';
      const identityMock = { spIdentity: { foo: 'bar' } };
      sessionServiceMock.get.mockResolvedValueOnce({
        spIdentity: identityMock,
      });
      const result = await service['findAccount'](ctx, sub);
      // When
      const claimsResult = await result.claims();
      // Then
      expect(claimsResult).toBe(identityMock);
      expect(ctx).toEqual({ not: 'altered' });
    });
    it('Should call throwError if an exception is catched', async () => {
      // Given
      const ctx = { not: 'altered' };
      const sub = 'foo';
      const exception = new Error('foo');
      sessionServiceMock.get.mockRejectedValueOnce(exception);
      service['throwError'] = jest.fn();
      // When
      await service['findAccount'](ctx, sub);
      // Then
      expect(service['throwError']).toHaveBeenCalledWith(ctx, exception);
      expect(ctx).toEqual({ not: 'altered' });
    });
  });

  describe('pairwiseIdentifier', () => {
    it('should return second argument as is', () => {
      // Given
      const ctx = {};
      const accountId = 'accountIdValue';
      // When
      const result = service['pairwiseIdentifier'](ctx, accountId);
      // Then
      expect(result).toBe(accountId);
    });
  });

  describe('registerEvent', () => {
    it('should call provider `in` method', () => {
      // Given
      const eventNameMock = OidcProviderEvents.USERINFO_ERROR;
      const handler = jest.fn();
      // When
      service.registerEvent(eventNameMock, handler);
      // Then
      expect(providerMock.on).toHaveBeenCalledTimes(1);
      expect(providerMock.on).toHaveBeenCalledWith(eventNameMock, handler);
    });
    it('should not execute handler on registration', () => {
      // Given
      const eventNameMock = OidcProviderEvents.USERINFO_ERROR;
      const handler = jest.fn();
      // When
      service.registerEvent(eventNameMock, handler);
      // Then
      expect(handler).toHaveBeenCalledTimes(0);
    });
  });

  describe('registerMiddlewares', () => {
    it('should register some events', () => {
      // Given
      service.registerMiddleware = jest.fn();
      // When
      service['registerMiddlewares']();
      // Then
      expect(service.registerMiddleware).toHaveBeenCalledTimes(3);
    });
  });

  describe('authorizationMiddleware', () => {
    const getCtxMock = (hasError = false) => {
      return {
        req: {
          headers: { 'x-forwarded-for': '123.123.123.123' },
        },
        oidc: {
          isError: hasError,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          params: { client_id: 'foo', acr_values: 'eidas3' },
        },
        res: {},
      };
    };
    it('should abort middleware execution if request if flagged as erroring', () => {
      // Given
      const ctxMock = getCtxMock(true);
      service['getInteractionIdFromCtx'] = jest.fn();

      // When
      service['authorizationMiddleware'](ctxMock);

      // Then
      expect(service['getInteractionIdFromCtx']).toHaveBeenCalledTimes(0);
      expect(serviceProviderServiceMock.getById).toHaveBeenCalledTimes(0);
      expect(sessionServiceMock.init).toHaveBeenCalledTimes(0);
      expect(trackingMock.track).toHaveBeenCalledTimes(0);
    });

    it('should call session.init', async () => {
      // Given
      const ctxMock = getCtxMock();
      service['getInteractionIdFromCtx'] = jest.fn().mockReturnValue('42');
      sessionServiceMock.init.mockResolvedValueOnce(undefined);

      // When
      await service['authorizationMiddleware'](ctxMock);

      // Then
      expect(sessionServiceMock.init).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.init).toHaveBeenCalledWith(ctxMock.res, '42', {
        spId: 'foo',
        spAcr: 'eidas3',
        spName: 'my SP',
      });
    });

    it('should throw if the session initialization fails', async () => {
      // Given
      const ctxMock = getCtxMock();
      service['getInteractionIdFromCtx'] = jest.fn().mockReturnValue('42');
      sessionServiceMock.init.mockRejectedValueOnce(new Error('test'));

      // Then
      await expect(
        service['authorizationMiddleware'](ctxMock),
      ).rejects.toThrow();
    });

    it('should call publish authorization event', async () => {
      // Given
      const ctxMock = getCtxMock();
      service['getInteractionIdFromCtx'] = jest.fn().mockReturnValue('42');
      sessionServiceMock.init.mockResolvedValueOnce(undefined);

      // When
      await service['authorizationMiddleware'](ctxMock);

      // Then
      expect(trackingMock.track).toHaveBeenCalledTimes(1);
      expect(trackingMock.track).toHaveBeenCalledWith(
        OidcProviderAuthorizationEvent,
        expect.any(Object),
      );
    });
  });

  describe('tokenMiddleware', () => {
    it('should publish a token event', () => {
      // Given
      const ctxMock = {
        req: {
          headers: { 'x-forwarded-for': '123.123.123.123' },
          // oidc
          // eslint-disable-next-line @typescript-eslint/naming-convention
          query: { client_id: 'foo', acr_values: 'eidas3' },
        },
        res: {},
      };
      service['getInteractionIdFromCtx'] = jest.fn().mockReturnValue('42');
      // When
      service['tokenMiddleware'](ctxMock);
      // Then
      expect(trackingMock.track).toHaveBeenCalledTimes(1);
      expect(trackingMock.track).toHaveBeenCalledWith(
        OidcProviderTokenEvent,
        expect.any(Object),
      );
    });

    it('should call throwError if getInteractionIdFromCtx throw an error', () => {
      // Given
      const ctxMock = { not: 'altered' };
      service['getInteractionIdFromCtx'] = jest.fn().mockImplementation(() => {
        throw unknownError;
      });
      service['throwError'] = jest.fn();
      // When
      service['tokenMiddleware'](ctxMock);
      // Then
      expect(service['throwError']).toHaveBeenCalledTimes(1);
      expect(service['throwError']).toHaveBeenCalledWith(
        ctxMock,
        expect.any(Error),
      );
    });

    it('should call throwError if getIpFromCtx throw an error', () => {
      // Given
      const ctxMock = { not: 'altered' };
      service['getIpFromCtx'] = jest.fn().mockImplementation(() => {
        throw unknownError;
      });
      service['throwError'] = jest.fn();
      // When
      service['tokenMiddleware'](ctxMock);
      // Then
      expect(service['throwError']).toHaveBeenCalledTimes(1);
      expect(service['throwError']).toHaveBeenCalledWith(
        ctxMock,
        expect.any(Error),
      );
    });

    it('should call throwError if tracking.track throw an error', () => {
      // Given
      const ctxMock = { not: 'altered' };
      trackingMock.track.mockImplementation(() => {
        throw unknownError;
      });
      service['throwError'] = jest.fn();
      // When
      service['tokenMiddleware'](ctxMock);
      // Then
      expect(service['throwError']).toHaveBeenCalledTimes(1);
      expect(service['throwError']).toHaveBeenCalledWith(
        ctxMock,
        expect.any(Error),
      );
    });
  });

  describe('userinfoMiddleware', () => {
    it('should publish a token event', () => {
      // Given
      const ctxMock = {
        req: {
          headers: { 'x-forwarded-for': '123.123.123.123' },
          // oidc
          // eslint-disable-next-line @typescript-eslint/naming-convention
          query: { client_id: 'foo', acr_values: 'eidas3' },
        },
        res: {},
      };
      service['getInteractionIdFromCtx'] = jest.fn().mockReturnValue('42');
      // When
      service['userinfoMiddleware'](ctxMock);
      // Then
      expect(trackingMock.track).toHaveBeenCalledTimes(1);
      expect(trackingMock.track).toHaveBeenCalledWith(
        OidcProviderUserinfoEvent,
        expect.any(Object),
      );
    });

    it('should call throwError if getInteractionIdFromCtx throw an error', () => {
      // Given
      const ctxMock = { not: 'altered' };
      service['getInteractionIdFromCtx'] = jest.fn().mockImplementation(() => {
        throw unknownError;
      });
      service['throwError'] = jest.fn();
      // When
      service['userinfoMiddleware'](ctxMock);
      // Then
      expect(service['throwError']).toHaveBeenCalledTimes(1);
      expect(service['throwError']).toHaveBeenCalledWith(
        ctxMock,
        expect.any(Error),
      );
    });

    it('should call throwError if getIpFromCtx throw an error', () => {
      // Given
      const ctxMock = { not: 'altered' };
      service['getIpFromCtx'] = jest.fn().mockImplementation(() => {
        throw unknownError;
      });
      service['throwError'] = jest.fn();
      // When
      service['userinfoMiddleware'](ctxMock);
      // Then
      expect(service['throwError']).toHaveBeenCalledTimes(1);
      expect(service['throwError']).toHaveBeenCalledWith(
        ctxMock,
        expect.any(Error),
      );
    });

    it('should call throwError if tracking.track throw an error', () => {
      // Given
      const ctxMock = { not: 'altered' };
      trackingMock.track.mockRejectedValueOnce(unknownError);
      service['throwError'] = jest.fn();
      // When
      service['userinfoMiddleware'](ctxMock);
      // Then
      expect(service['throwError']).toHaveBeenCalledTimes(1);
      expect(service['throwError']).toHaveBeenCalledWith(
        ctxMock,
        expect.any(Error),
      );
    });
  });

  describe('getInteractionIdFromCtx', () => {
    it('should call getInteractionIdFromCtxEntities', () => {
      // Given
      const ctxMock = { req: { url: '/token' } };
      service['getInteractionIdFromCtxEntities'] = jest
        .fn()
        .mockReturnValue('42');
      // When
      service['getInteractionIdFromCtx'](ctxMock);
      // Then
      expect(service['getInteractionIdFromCtxEntities']).toHaveBeenCalledTimes(
        1,
      );
      expect(service['getInteractionIdFromCtxEntities']).toHaveBeenCalledWith(
        ctxMock,
      );
    });
    it('should call getInteractionIdFromCtxSymbol', () => {
      // Given
      const ctxMock = { req: { url: '/somewhere' } };
      service['getInteractionIdFromCtxSymbol'] = jest
        .fn()
        .mockReturnValue('42');
      // When
      service['getInteractionIdFromCtx'](ctxMock);
      // Then
      expect(service['getInteractionIdFromCtxSymbol']).toHaveBeenCalledTimes(1);
      expect(service['getInteractionIdFromCtxSymbol']).toHaveBeenCalledWith(
        ctxMock,
      );
    });
    it('should throw', () => {
      // Given
      const ctxMock = { req: { url: '/somewhere' } };
      service['getInteractionIdFromCtxSymbol'] = jest
        .fn()
        .mockReturnValue(undefined);

      // Then
      expect(() => service['getInteractionIdFromCtx'](ctxMock)).toThrow(
        OidcProviderInteractionNotFoundException,
      );
    });
  });

  describe('getInteractionIdFromCtxSymbol', () => {
    it('should retrieve interactionId symbol key', () => {
      // Given
      const ctxMock = { oidc: { [interactionIdSymbol]: '42' } };
      // When
      const result = service['getInteractionIdFromCtxSymbol'](ctxMock);
      // Then
      expect(result).toBe('42');
    });
  });

  describe('getInteractionIdFromCtxEntities', () => {
    it('should retrieve interactionId from entities', () => {
      // Given
      const ctxMock = {
        oidc: { entities: { Account: { accountId: '42' } } },
      };
      // When
      const result = service['getInteractionIdFromCtxEntities'](ctxMock);
      // Then
      expect(result).toBe('42');
    });
  });

  describe('registerMiddleware', () => {
    it('should register middleware but not call callback on middleware registration', () => {
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

    it('should call provider use with callback function BEFORE', () => {
      // Given
      providerMock.middlewares = [];
      const callback = jest.fn();
      const ctx = { path: OidcProviderMiddlewarePattern.USERINFO };
      const next = async () => Promise.resolve();
      // When
      service.registerMiddleware(
        OidcProviderMiddlewareStep.BEFORE,
        OidcProviderMiddlewarePattern.USERINFO,
        callback,
      );
      providerMock.middlewares[0].call(null, ctx, next);
      // Then
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call provider use with callback function AFTER', async () => {
      // Given
      providerMock.middlewares = [];
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      const next = () => async () => Promise.resolve();
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
    it('should match on path', async () => {
      // Given
      providerMock.middlewares = [];
      const callback = jest.fn();
      const ctx = {
        path: OidcProviderMiddlewarePattern.USERINFO,
      };
      const next = () => async () => Promise.resolve();
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

  describe('renderError', () => {
    it('should call exceptionFilter.catch', () => {
      // Given
      const ctx = { res: {} } as KoaContextWithOIDC;
      const out = '';
      const error = new Error('foo bar');
      // When
      service['renderError'](ctx, out, error);
      // Then
      expect(exceptionFilterMock.catch).toHaveBeenCalledTimes(1);
    });
  });

  describe('catchErrorEvents', () => {
    it('should call register event for each error case', () => {
      // Given
      service.registerEvent = jest.fn();
      const EVENT_COUNT = 17;
      // When
      service.catchErrorEvents();
      // Then
      expect(service.registerEvent).toHaveBeenCalledTimes(EVENT_COUNT);
    });
  });

  describe('triggerError', () => {
    it('should call throwError with OidcProviderunTimeException if error is not an FcException', () => {
      // Given
      const eventName = OidcProviderEvents.SESSION_SAVED;
      const func = service['triggerError'].bind(service, eventName);
      const ctxMock = { oidc: {} };
      const errorMock = Error('some error');
      service['throwError'] = jest.fn();
      // When
      func(ctxMock, errorMock);
      // Then
      expect(service['throwError']).toHaveBeenCalledTimes(1);
      expect(service['throwError']).toHaveBeenCalledWith(
        ctxMock,
        expect.any(OidcProviderRuntimeException),
      );
    });
    it('should flag request as erroring', () => {
      // Given
      const eventName = OidcProviderEvents.SESSION_SAVED;
      const func = service['triggerError'].bind(service, eventName);
      const ctxMock = { oidc: {} };
      const errorMock = Error('some error');
      service['throwError'] = jest.fn();
      // When
      func(ctxMock, errorMock);
      // Then
      expect(ctxMock.oidc['isError']).toBe(true);
    });
    it('should call throwError with original exception if error is an FcException and does a redirection', () => {
      // Given
      const eventName = OidcProviderEvents.SESSION_SAVED;
      const func = service['triggerError'].bind(service, eventName);
      const ctxMock = { oidc: {} };
      const errorMock = new OidcProviderInitialisationException(Error('foo'));
      errorMock.redirect = true;
      service['throwError'] = jest.fn();
      // When
      func(ctxMock, errorMock);
      // Then
      expect(service['throwError']).toHaveBeenCalledTimes(1);
      expect(service['throwError']).toHaveBeenCalledWith(ctxMock, errorMock);
    });
    it('should not call throwError with original exception if error is an FcException and does no redirection', () => {
      // Given
      const eventName = OidcProviderEvents.SESSION_SAVED;
      const func = service['triggerError'].bind(service, eventName);
      const ctxMock = { oidc: {} };
      const errorMock = new OidcProviderInitialisationException(Error('foo'));
      errorMock.redirect = false;
      service['throwError'] = jest.fn();
      // When
      func(ctxMock, errorMock);
      // Then
      expect(service['throwError']).toHaveBeenCalledTimes(0);
    });
  });

  describe('logoutSource', () => {
    it('should call exceptionFilter.catch', () => {
      // Given
      const ctx = { body: '' } as KoaContextWithOIDC;
      const form = '<form></form>';
      const resultExpected = `<!DOCTYPE html>
      <head>
        <title>Logout</title>
      </head>
      <body>
        <form></form>
        <script>
          var form = document.forms[0];
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'logout';
          input.value = 'yes';
          form.appendChild(input);
          form.submit();
        </script>
      </body>
      </html>`;
      // When
      service['logoutSource'](ctx, form);
      // Then
      expect(ctx.body).toBe(resultExpected);
    });
  });

  describe('getConfig', () => {
    it('should call several services and concat their ouputs', async () => {
      // Given
      RedisAdapter.getConstructorWithDI = jest
        .fn()
        .mockReturnValue(redisAdapterMock);
      // When
      const result = await service['getConfig']();
      // Then
      expect(serviceProviderServiceMock.getList).toHaveBeenCalledTimes(1);
      expect(serviceProviderServiceMock.getList).toHaveBeenCalledWith(false);

      expect(RedisAdapter.getConstructorWithDI).toHaveBeenCalledTimes(1);
      expect(RedisAdapter.getConstructorWithDI).toHaveBeenCalledWith(service);

      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('OidcProvider');

      expect(result).toMatchObject(configOidcProviderMock);
    });

    it('should pass refresh flag to serviceProvider Service', async () => {
      // When
      await service['getConfig'](true);
      // Then
      expect(serviceProviderServiceMock.getList).toHaveBeenCalledTimes(1);
      expect(serviceProviderServiceMock.getList).toHaveBeenCalledWith(true);
    });

    it('should bind methods to config', async () => {
      // When
      const result = await service['getConfig'](true);
      // Then
      expect(result).toHaveProperty('configuration.findAccount');
      expect(result).toHaveProperty('configuration.renderError');
      expect(result).toHaveProperty('configuration.logoutSource');
    });
  });

  describe('clientBasedCORS', () => {
    it('Should return false', () => {
      // Given
      const ctx = {} as KoaContextWithOIDC;
      const origin = {};
      const client = {} as ClientMetadata;

      // When
      const result = service['clientBasedCORS'](ctx, origin, client);

      // Then
      expect(result).toBeFalsy();
    });
  });

  describe('url', () => {
    it('Should return interaction url with prefix', async () => {
      // Given
      const prefix = '/prefix';
      const ctx = ({
        oidc: { uid: 123 },
      } as unknown) as KoaContextWithOIDC;
      const interaction = {};

      // When
      const result = await service['url'](prefix, ctx, interaction);

      // Then
      expect(result).toEqual('/prefix/interaction/123');
    });
  });

  describe('getHttpOptions', () => {
    const timeoutMock = 42;
    it('Should return the timeout http options', () => {
      // Given
      const options = {
        timeout: timeoutMock,
      };

      service['configuration'] = options;

      // When
      const result = service['getHttpOptions'](options);
      // Then
      expect(result).toStrictEqual({
        timeout: timeoutMock,
      });
    });
  });
});
