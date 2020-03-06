import { Test, TestingModule } from '@nestjs/testing';
import { OidcProviderService } from './oidc-provider.service';
import { HttpAdapterHost } from '@nestjs/core';
import { Provider } from 'oidc-provider';
import { ConfigService } from '@fc/config';
import { oidcProviderHooks, oidcProviderEvents } from './enums';

describe('OidcProviderService', () => {
  let service: OidcProviderService;

  const httpAdapterHostMock = {
    httpAdapter: {
      use: jest.fn(),
    },
  };

  const configServiceMock = {
    get: () => ({
      issuer: 'http://foo.bar',
      configuration: {},
    }),
  };

  const useSpy = jest.fn();

  const providerMock = {
    middlewares: [],
    use: middleware => {
      providerMock.middlewares.push(middleware);
      useSpy();
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OidcProviderService, HttpAdapterHost, ConfigService],
    })
      .overrideProvider(HttpAdapterHost)
      .useValue(httpAdapterHostMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<OidcProviderService>(OidcProviderService);

    jest.resetAllMocks();
  });

  describe('contructor', () => {
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
