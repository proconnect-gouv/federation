import { KoaContextWithOIDC, Provider } from 'oidc-provider';
import { JWK } from 'jose';
import * as MemoryAdapter from 'oidc-provider/lib/adapters/memory_adapter';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@fc/config';
import { REDIS_CONNECTION_TOKEN } from '@fc/redis';
import { LoggerService, LogLevelNames } from '@fc/logger';
import { FcExceptionFilter } from '@fc/error';
import {
  OidcProviderEvents,
  OidcProviderMiddlewareStep,
  OidcProviderMiddlewarePattern,
  ErrorCode,
} from './enums';
import { IDENTITY_SERVICE, SERVICE_PROVIDER_SERVICE } from './tokens';
import { OidcProviderService } from './oidc-provider.service';
import {
  OidcProviderInitialisationException,
  OidcProviderBindingException,
  OidcProviderRuntimeException,
} from './exceptions';

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

  const loggerServiceMock = ({
    setContext: jest.fn(),
    verbose: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  const serviceProviderServiceMock = {
    getList: jest.fn(),
  };

  const useSpy = jest.fn();

  const providerMock = {
    middlewares: [],
    use: middleware => {
      providerMock.middlewares.push(middleware);
      useSpy();
    },
    on: jest.fn(),
    interactionDetails: jest.fn(),
    interactionFinished: jest.fn(),
  };

  const identityServiceMock = {
    getIdentity: jest.fn(),
  };

  const exceptionFilterMock = {
    catch: jest.fn(),
  };

  const redisMock = {
    hgetall: jest.fn(),
    get: jest.fn(),
    multi: jest.fn(),
    hset: jest.fn(),
    ttl: jest.fn(),
    lrange: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        LoggerService,
        OidcProviderService,
        HttpAdapterHost,
        FcExceptionFilter,
        {
          provide: IDENTITY_SERVICE,
          useValue: identityServiceMock,
        },
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
      .compile();

    module.useLogger(loggerServiceMock);

    service = module.get<OidcProviderService>(OidcProviderService);
    jest.resetAllMocks();

    configServiceMock.get.mockImplementation(module => {
      switch (module) {
        case 'OidcProvider':
          return {
            issuer: 'http://foo.bar',
            configuration: { adapter: MemoryAdapter, jwks: { keys: [] } },
          };
        case 'Logger':
          return {
            path: '/dev/null',
            level: LogLevelNames.TRACE,
            isDevelopment: false,
          };
      }
    });

    service['provider'] = providerMock as any;
  });

  describe('onModuleInit', () => {
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
  });

  describe('wellKnownKeys', () => {
    it('should return keys', async () => {
      // Given
      const JwkKeyMock = {
        toJWK: jest
          .fn()
          .mockReturnValueOnce('a')
          .mockReturnValueOnce('b'),
      };
      const spy = jest.spyOn(JWK, 'asKey').mockReturnValue(JwkKeyMock as any);

      configServiceMock.get.mockReturnValueOnce({
        configuration: { jwks: { keys: ['foo', 'bar'] } },
      });

      // When
      const result = await service.wellKnownKeys();
      // Then
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith('foo');
      expect(spy).toHaveBeenCalledWith('bar');
      expect(JwkKeyMock.toJWK).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ keys: ['a', 'b'] });
    });
  });

  describe('scheduleConfigurationReload', () => {
    it('Should call getConfig and overrideConfiguration', async () => {
      // Given
      jest.useFakeTimers();
      // Can't use jest.spyOn() on private
      const overrideConfigurationMock = jest.fn();
      const getConfigMock = jest
        .fn()
        .mockResolvedValue({ reloadConfigDelayInMs: 1000 });
      service['overrideConfiguration'] = overrideConfigurationMock;
      service['getConfig'] = getConfigMock;
      // When
      await service['scheduleConfigurationReload']();
      // Then
      expect(getConfigMock).toHaveBeenCalledTimes(1);
      expect(overrideConfigurationMock).toHaveBeenCalledTimes(1);
    });

    it('shoud call schedule recursive all with setTimeout() and correct reloadConfigDelayInMs', async () => {
      // Given
      jest.useFakeTimers();
      const reloadConfigDelayInMs = 1000;
      const overrideConfigurationMock = jest.fn();
      const getConfigMock = jest
        .fn()
        .mockResolvedValue({ reloadConfigDelayInMs });
      service['overrideConfiguration'] = overrideConfigurationMock;
      service['getConfig'] = getConfigMock;
      // When
      await service['scheduleConfigurationReload']();
      // Then
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(
        service['scheduleConfigurationReload'],
        reloadConfigDelayInMs,
      );
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
    it('should return the result of oidc-provider.interactionFinished()', async () => {
      // Given
      const reqMock = {};
      const resMock = {};
      const resultMock = {};
      const resolvedValue = Symbol('resolved value');
      providerMock.interactionFinished.mockResolvedValueOnce(resolvedValue);
      // When
      const result = await service.finishInteraction(
        reqMock,
        resMock,
        resultMock,
      );
      // Then
      expect(result).toBe(resolvedValue);
    });
    it('should throw OidcProviderRuntimeException', async () => {
      // Given
      const reqMock = {};
      const resMock = {};
      const resultMock = {};
      const nativeError = new Error('invalid_request');
      providerMock.interactionFinished.mockRejectedValueOnce(nativeError);

      await expect(
        service.finishInteraction(reqMock, resMock, resultMock),
      ).rejects.toThrow(OidcProviderRuntimeException);
    });
  });

  describe('findAccount', () => {
    it('Should return an object with accountID', async () => {
      // Given
      const ctx = { not: 'altered' };
      const sub = 'foo';
      const identityMock = {};
      identityServiceMock.getIdentity.mockResolvedValueOnce(identityMock);
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
      const identityMock = {};
      identityServiceMock.getIdentity.mockResolvedValueOnce({
        identity: identityMock,
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
      identityServiceMock.getIdentity.mockRejectedValueOnce(exception);
      service['throwError'] = jest.fn();
      // When
      await service['findAccount'](ctx, sub);
      // Then
      expect(service['throwError']).toHaveBeenCalledWith(ctx, exception);
      expect(ctx).toEqual({ not: 'altered' });
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
      const ctxMock = {};
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
    it('should call throwError with original exception if error is an FcException', () => {
      // Given
      const eventName = OidcProviderEvents.SESSION_SAVED;
      const func = service['triggerError'].bind(service, eventName);
      const ctxMock = {};
      const errorMock = new OidcProviderInitialisationException(Error('foo'));
      service['throwError'] = jest.fn();
      // When
      func(ctxMock, errorMock);
      // Then
      expect(service['throwError']).toHaveBeenCalledTimes(1);
      expect(service['throwError']).toHaveBeenCalledWith(ctxMock, errorMock);
    });
  });

  describe('decodeAuthorizationHeader', () => {
    it('Should return the client id from authorization header', () => {
      // Given
      const authorizationHeader = 'Basic YWJjMTIzOmF6ZXJ0eQ==';
      // When
      const result = service.decodeAuthorizationHeader(authorizationHeader);
      // Then
      expect(result).toBe('abc123');
    });

    it('Should return an empty string if authorization header is empty', () => {
      // Given
      const authorizationHeader = '';
      // When
      const result = service.decodeAuthorizationHeader(authorizationHeader);
      // Then
      expect(result).toBe('');
    });

    it('Should return an empty string if authorization header has not a good format', () => {
      // Given
      const authorizationHeader = 'authorization_header_wrong_format';
      // When
      const result = service.decodeAuthorizationHeader(authorizationHeader);
      // Then
      expect(result).toBe('');
    });

    it('Should return an empty string if base64ToUtf8 is not a combinaison of client id and client secret (client_id:client_secret)', () => {
      // Given
      const authorizationHeader = 'authorization header';
      // When
      const result = service.decodeAuthorizationHeader(authorizationHeader);
      // Then
      expect(result).toBe('');
    });
  });
});
