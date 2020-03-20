import { Test, TestingModule } from '@nestjs/testing';
import { OidcProviderService } from './oidc-provider.service';
import { HttpAdapterHost } from '@nestjs/core';
import { Provider, KoaContextWithOIDC } from 'oidc-provider';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { oidcProviderHooks, oidcProviderEvents } from './enums';
import { LogLevelNames } from '@fc/logger';
import { FcExceptionFilter } from '@fc/error';
import { IDENTITY_MANAGEMENT_SERVICE, SP_MANAGEMENT_SERVICE } from './tokens';

describe('OidcProviderService', () => {
  let service: OidcProviderService;

  const httpAdapterHostMock = {
    httpAdapter: {
      use: jest.fn(),
    },
  };

  const configServiceMock = {
    get: module => {
      switch (module) {
        case 'OidcProvider':
          return { issuer: 'http://foo.bar', configuration: {} };
        case 'Logger':
          return {
            path: '/dev/null',
            level: LogLevelNames.TRACE,
            isDevelopment: false,
          };
      }
    },
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    verbose: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  const spManagementServiceMock = {
    getList: jest.fn(),
  };

  const useSpy = jest.fn();

  const providerMock = {
    middlewares: [],
    use: middleware => {
      providerMock.middlewares.push(middleware);
      useSpy();
    },
  };

  const identityManagementServiceMock = {
    getIdentity: jest.fn(),
  };

  const exceptionFilterMock = {
    catch: jest.fn(),
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
          provide: IDENTITY_MANAGEMENT_SERVICE,
          useValue: identityManagementServiceMock,
        },
        {
          provide: SP_MANAGEMENT_SERVICE,
          useValue: spManagementServiceMock,
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
  });

  describe('constructor', () => {
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

    it('should return oidc-provier instance', async () => {
      // When
      await service.onModuleInit();
      const instance = service.getProvider();
      // Then
      expect(instance).toBeInstanceOf(Provider);
      expect(instance).toBe(service['provider']);
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
      const configuration = service.getProvider()['configuration'];
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

  describe('findAccount', () => {
    it('Should return an object with accountID', async () => {
      // Given
      const ctx = {};
      const sub = 'foo';
      const identityMock = {};
      identityManagementServiceMock.getIdentity.mockResolvedValueOnce(
        identityMock,
      );
      // When
      const result = await service['findAccount'](ctx, sub);
      // Then
      expect(result).toHaveProperty('accountId');
      expect(result.accountId).toBe('foo');
    });
    it('Should return an object with a claims function that returns identity', async () => {
      // Given
      const ctx = {};
      const sub = 'foo';
      const identityMock = {};
      identityManagementServiceMock.getIdentity.mockResolvedValueOnce(
        identityMock,
      );
      const result = await service['findAccount'](ctx, sub);
      // When
      const claimsResult = await result.claims();
      // Then
      expect(claimsResult).toBe(identityMock);
    });
  });

  describe('hook', () => {
    it('should register hook but not call callback on hook registration', () => {
      // Given
      providerMock.middlewares = [];
      const originalProvider = service['provider'];
      service['provider'] = providerMock as any;
      const callback = jest.fn();
      // When
      service.hook(
        oidcProviderHooks.BEFORE,
        oidcProviderEvents.USERINFO,
        callback,
      );
      // Then
      expect(useSpy).toBeCalledTimes(1);
      expect(providerMock.middlewares).toHaveLength(1);
      expect(callback).toHaveBeenCalledTimes(0);
      service['provider'] = originalProvider;
    });

    it('should call provider use with callback function BEFORE', () => {
      // Given
      providerMock.middlewares = [];
      const originalProvider = service['provider'];
      service['provider'] = providerMock as any;
      const callback = jest.fn();
      const ctx = { path: oidcProviderEvents.USERINFO };
      const next = async () => Promise.resolve();
      // When
      service.hook(
        oidcProviderHooks.BEFORE,
        oidcProviderEvents.USERINFO,
        callback,
      );
      providerMock.middlewares[0].call(null, ctx, next);
      // Then
      expect(callback).toHaveBeenCalledTimes(1);
      // Restore
      service['provider'] = originalProvider;
    });

    it('should call provider use with callback function AFTER', async () => {
      // Given
      providerMock.middlewares = [];
      const originalProvider = service['provider'];
      service['provider'] = providerMock as any;
      const callback = jest.fn();
      const ctx = { oidc: { route: oidcProviderEvents.USERINFO } };
      const next = () => async () => Promise.resolve();
      // When
      service.hook(
        oidcProviderHooks.AFTER,
        oidcProviderEvents.USERINFO,
        callback,
      );
      await providerMock.middlewares[0].call(null, ctx, next);
      // Then
      expect(callback).toHaveBeenCalledTimes(1);
      // Restore
      service['provider'] = originalProvider;
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
});
