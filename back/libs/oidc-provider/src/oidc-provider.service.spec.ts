import * as OidcProvider from 'oidc-provider';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpAdapterHost } from '@nestjs/core';
import { REDIS_CONNECTION_TOKEN } from '@fc/redis';
import { LoggerService, LoggerLevelNames } from '@fc/logger';
import { OidcSession } from '@fc/oidc';
import {
  OidcProviderMiddlewareStep,
  OidcProviderMiddlewarePattern,
} from './enums';
import { OidcProviderService } from './oidc-provider.service';
import {
  OidcProviderInitialisationException,
  OidcProviderBindingException,
  OidcProviderRuntimeException,
  OidcProviderInteractionNotFoundException,
} from './exceptions';
import { OidcProviderErrorService } from './services/oidc-provider-error.service';
import { OidcProviderConfigService } from './services/oidc-provider-config.service';

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
  const oidcProviderRedisAdapterMock = class AdapterMock {};
  const configOidcProviderMock = {
    prefix: '/api',
    issuer: 'http://foo.bar',
    configuration: {
      adapter: oidcProviderRedisAdapterMock,
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
    set: jest.fn(),
    get: jest.fn(),
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

  const redisMock = {
    hgetall: jest.fn(),
    get: jest.fn(),
    multi: jest.fn(),
    hset: jest.fn(),
    ttl: jest.fn(),
    lrange: jest.fn(),
    del: jest.fn(),
  };

  const oidcProviderErrorServiceMock = {
    catchErrorEvents: jest.fn(),
    throwError: jest.fn(),
  };

  const oidcProviderConfigServiceMock = {
    getConfig: jest.fn(),
    findAccount: jest.fn(),
  };

  const interactionIdSymbol = Symbol('context#uid');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcProviderService,
        HttpAdapterHost,
        LoggerService,
        {
          provide: REDIS_CONNECTION_TOKEN,
          useValue: redisMock,
        },
        OidcProviderErrorService,
        OidcProviderConfigService,
      ],
    })
      .overrideProvider(HttpAdapterHost)
      .useValue(httpAdapterHostMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(OidcProviderErrorService)
      .useValue(oidcProviderErrorServiceMock)
      .overrideProvider(OidcProviderConfigService)
      .useValue(oidcProviderConfigServiceMock)
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
            level: LoggerLevelNames.TRACE,
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
      oidcProviderConfigServiceMock.getConfig.mockReturnValueOnce(
        configOidcProviderMock,
      );
      oidcProviderConfigServiceMock.getConfig.mockImplementation(() => ({
        paramsMock: 'paramMocks',
      }));
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
      expect(service['provider']).toBeInstanceOf(OidcProvider.Provider);
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
      expect(service['errorService']['catchErrorEvents']).toHaveBeenCalledTimes(
        1,
      );
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
      service['configService'][
        'overrideConfiguration'
      ] = overrideConfigurationMock;
      service['configService']['getConfig'] = getConfigMock;
      // When
      await service['reloadConfiguration']();
      // Then
      expect(getConfigMock).toHaveBeenCalledTimes(1);
      expect(overrideConfigurationMock).toHaveBeenCalledTimes(1);
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
      const sessionDataMock: OidcSession = {
        spAcr: 'spAcrValue',
      };
      sessionServiceMock.get.mockResolvedValueOnce(sessionDataMock);
      // When
      const result = await service.finishInteraction(
        reqMock,
        resMock,
        sessionDataMock,
      );
      // Then
      expect(result).toBe(resolvedValue);
    });

    it('should throw OidcProviderRuntimeException', async () => {
      // Given
      const nativeError = new Error('invalid_request');
      providerMock.interactionFinished.mockRejectedValueOnce(nativeError);
      const sessionDataMock: OidcSession = {
        spAcr: 'spAcrValue',
      };
      sessionServiceMock.get.mockResolvedValueOnce(sessionDataMock);
      // Then
      await expect(
        service.finishInteraction(reqMock, resMock, sessionDataMock),
      ).rejects.toThrow(OidcProviderRuntimeException);
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
      service['runMiddlewareBeforePattern'] = jest.fn();
      // When
      service.registerMiddleware(
        OidcProviderMiddlewareStep.BEFORE,
        OidcProviderMiddlewarePattern.USERINFO,
        callback,
      );
      providerMock.middlewares[0].call(null, ctx, next);
      // Then
      expect(service['runMiddlewareBeforePattern']).toHaveBeenCalledTimes(1);
    });

    it('should call provider use with callback function AFTER', async () => {
      // Given
      providerMock.middlewares = [];
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      const next = () => async () => Promise.resolve();
      service['runMiddlewareAfterPattern'] = jest.fn();
      // When
      service.registerMiddleware(
        OidcProviderMiddlewareStep.AFTER,
        OidcProviderMiddlewarePattern.USERINFO,
        callback,
      );
      await providerMock.middlewares[0].call(null, ctx, next);
      // Then
      expect(service['runMiddlewareAfterPattern']).toHaveBeenCalledTimes(1);
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
  describe('runMiddlewareBeforePattern', () => {
    it('should call the callback if path param equal pattern with good step', async () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      service['runMiddlewareBeforePattern'](
        {
          step: OidcProviderMiddlewareStep.BEFORE,
          path: OidcProviderMiddlewarePattern.USERINFO,
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(1);
    });
    it('should not call the callback method if wrong path is send', () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      service['runMiddlewareBeforePattern'](
        {
          step: OidcProviderMiddlewareStep.BEFORE,
          path: '',
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(0);
    });
    it('should not call the callback method if wrong step is send', () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      service['runMiddlewareBeforePattern'](
        {
          step: OidcProviderMiddlewareStep.AFTER,
          path: OidcProviderMiddlewarePattern.USERINFO,
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(0);
    });
  });

  describe('runMiddlewareAfterPattern', () => {
    it('should call the callback if route param equal pattern with good step', async () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      service['runMiddlewareAfterPattern'](
        {
          step: OidcProviderMiddlewareStep.AFTER,
          route: OidcProviderMiddlewarePattern.USERINFO,
          path: '',
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(1);
    });
    it('should call the callback if path param equal pattern with good step', async () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      service['runMiddlewareAfterPattern'](
        {
          step: OidcProviderMiddlewareStep.AFTER,
          route: '',
          path: OidcProviderMiddlewarePattern.USERINFO,
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(1);
    });
    it('should not call the callback method if wrong step is send', () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      service['runMiddlewareAfterPattern'](
        {
          step: OidcProviderMiddlewareStep.BEFORE,
          route: OidcProviderMiddlewarePattern.USERINFO,
          path: OidcProviderMiddlewarePattern.USERINFO,
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(0);
    });
    it('should not call the callback method if wrong path or route is send', () => {
      // Given
      const callback = jest.fn();
      const ctx = {
        oidc: { route: OidcProviderMiddlewarePattern.USERINFO },
      };
      // When
      service['runMiddlewareAfterPattern'](
        {
          step: OidcProviderMiddlewareStep.BEFORE,
          route: '',
          path: '',
          pattern: OidcProviderMiddlewarePattern.USERINFO,
          ctx,
        },
        callback,
      );
      // Then
      expect(callback).toHaveBeenCalledTimes(0);
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
});
