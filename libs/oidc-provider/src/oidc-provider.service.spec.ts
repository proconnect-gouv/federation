import { Test, TestingModule } from '@nestjs/testing';
import { OidcProviderService } from './oidc-provider.service';
import { HttpAdapterHost } from '@nestjs/core';
import { Provider } from 'oidc-provider';

describe('OidcProviderService', () => {
  let service: OidcProviderService;

  const expressMock = {
    use: jest.fn(),
  };

  const httpAdapterHostMock = {
    httpAdapter: {
      getInstance: () => expressMock,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OidcProviderService, HttpAdapterHost],
    })
      .overrideProvider(HttpAdapterHost)
      .useValue(httpAdapterHostMock)
      .compile();

    service = module.get<OidcProviderService>(OidcProviderService);

    jest.resetAllMocks();
  });

  it('Should create oidc-provider instance', () => {
    // Then
    expect(service).toBeDefined();
    // Access to private property via []
    expect(service['provider']).toBeInstanceOf(Provider);
  });

  it('should mount oidc-provider in express', () => {
    // When
    service.onModuleInit();
    // Then
    expect(expressMock.use).toHaveBeenCalledTimes(1);
    /**
     * Sadly we can't test `toHaveBeenCalledWith(service['provider'].callback)`
     * since `̀Provider.callback` is a getter that returns an anonymous function
     */
  });

  it('should return oidc-provier instance', () => {
    // When
    const instance = service.getProvider();
    // Then
    expect(instance).toBeInstanceOf(Provider);
    expect(instance).toBe(service['provider']);
  });
});
