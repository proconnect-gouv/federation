import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@fc/config';
import { LoggerService, LogLevelNames } from '@fc/logger';
import { SessionService } from '@fc/session';
import Provider, { ClientMetadata, KoaContextWithOIDC } from 'oidc-provider';
import { SERVICE_PROVIDER_SERVICE_TOKEN } from '@fc/oidc';
import { OidcProviderConfigService } from './oidc-provider-config.service';
import { OidcProviderErrorService } from './oidc-provider-error.service';
import { RedisAdapter } from '../adapters';
import { OidcProviderService } from '../oidc-provider.service';

describe('OidcProviderErrorService', () => {
  let service: OidcProviderConfigService;

  const loggerServiceMock = ({
    setContext: jest.fn(),
    verbose: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  const providerMock = ({
    middlewares: [],
    use: jest.fn(),
    on: jest.fn(),
    interactionDetails: jest.fn(),
    interactionFinished: jest.fn(),
  } as unknown) as Provider;

  const configServiceMock = {
    get: jest.fn(),
  };

  const sessionServiceMock = {
    init: jest.fn(),
    get: jest.fn(),
  };

  const errorServiceMock = {
    renderError: jest.fn(),
    throwError: jest.fn(),
  };

  const serviceProviderServiceMock = {
    getList: jest.fn(),
    getById: jest.fn(),
  };

  const redisAdapterMock = class AdapterMock {};

  const oidcProviderServiceMock = {} as OidcProviderService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcProviderConfigService,
        LoggerService,
        ConfigService,
        SessionService,
        OidcProviderErrorService,
        {
          provide: SERVICE_PROVIDER_SERVICE_TOKEN,
          useValue: serviceProviderServiceMock,
        },
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(OidcProviderErrorService)
      .useValue(errorServiceMock)
      .compile();

    module.useLogger(loggerServiceMock);

    service = module.get<OidcProviderConfigService>(OidcProviderConfigService);
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
  });

  describe('overrideConfiguration', () => {
    it('should make the configuration method return fresh data', () => {
      // Given
      const configMock = {
        foo: {
          bar: 'bar value',
        },
      };
      service['provider'] = providerMock;
      // When
      service.overrideConfiguration(configMock, service['provider']);
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
      service.overrideConfiguration(newerConfigMock, service['provider']);
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
      service['provider'] = providerMock;
      // When
      service.overrideConfiguration(configMock, service['provider']);
      const result = service['provider']['configuration']();
      // Then
      expect(result).toBe(configMock);
    });
  });

  describe('getConfig', () => {
    it('should call several services and concat their ouputs', async () => {
      // Given
      RedisAdapter.getConstructorWithDI = jest
        .fn()
        .mockReturnValue(redisAdapterMock);
      // When
      const result = await service.getConfig(oidcProviderServiceMock);
      // Then
      expect(serviceProviderServiceMock.getList).toHaveBeenCalledTimes(1);

      expect(RedisAdapter.getConstructorWithDI).toHaveBeenCalledTimes(1);
      expect(RedisAdapter.getConstructorWithDI).toHaveBeenCalledWith(
        oidcProviderServiceMock,
      );

      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('OidcProvider');

      expect(result).toMatchObject(configOidcProviderMock);
    });

    it('should pass refresh flag to serviceProvider Service', async () => {
      // When
      await service.getConfig(oidcProviderServiceMock);
      // Then
      expect(serviceProviderServiceMock.getList).toHaveBeenCalledTimes(1);
    });

    it('should bind methods to config', async () => {
      // When
      const result = await service.getConfig(oidcProviderServiceMock);
      // Then
      expect(result).toHaveProperty('configuration.findAccount');
      expect(result).toHaveProperty('configuration.renderError');
      expect(result).toHaveProperty(
        'configuration.rpInitiatedLogout.logoutSource',
      );
    });
  });

  describe('url', () => {
    it('Should return a relative interaction url with prefix', async () => {
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
    });
    it('Should not alter the context', async () => {
      // Given
      const ctx = { not: 'altered' };
      const sub = 'foo';
      // When
      await service['findAccount'](ctx, sub);
      // Then
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
      expect(service['errorService']['throwError']).toHaveBeenCalledWith(
        ctx,
        exception,
      );
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

  describe('clientBasedCORS', () => {
    it('Should return false', () => {
      // Given
      const ctx = {} as KoaContextWithOIDC;
      const origin = {};
      const client = {} as ClientMetadata;

      // When
      const result = service['clientBasedCORS'](ctx, origin, client);

      // Then
      expect(result).toBe(false);
    });
  });
});
