import { Test, TestingModule } from '@nestjs/testing';
import { OidcClientService } from './oidc-client.service';
import { JWK } from 'jose';
import { ConfigService } from '@fc/config';
import { LoggerService, LogLevelNames } from '@fc/logger';
import { IDENTITY_PROVIDER_SERVICE } from './tokens';
import { ClientMetadata } from 'oidc-provider';
import { OidcClientConfig } from './dto';
import {
  OidcClientProviderNotFoundException,
  OidcClientProviderDisabledException,
} from './exceptions';

describe('OidcClientService', () => {
  let service: OidcClientService;

  const configServiceMock = {
    get: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  const IdentityProviderServiceMock = { getList: jest.fn() };
  const authorizationUrlMock = jest.fn();
  const callbackParamsMock = jest.fn();
  const callbackMock = jest.fn();
  const userinfoMock = jest.fn();

  const getProviderMockReturnValue = {
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uris: ['redirect', 'uris'],
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    response_types: ['response', 'types'],
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    discoveryUrl: 'mock well-known url',
  };

  const getProviderMock = jest.fn();

  const IssuerClientMock = jest.fn();

  const IssuerProxyMock = {
    discover: jest.fn(),
  } as any;

  const createOidcClientMock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        LoggerService,
        OidcClientService,
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useValue: IdentityProviderServiceMock,
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = module.get<OidcClientService>(OidcClientService);

    jest.resetAllMocks();

    IdentityProviderServiceMock.getList.mockResolvedValue(
      'IdentityProviderServiceMock Resolve Value',
    );
    authorizationUrlMock.mockResolvedValue(
      'authorizationUrlMock Resolve Value',
    );
    callbackParamsMock.mockResolvedValue({ state: 'callbackParamsState' });

    callbackMock.mockResolvedValue('callbackMock Resolve Value');
    userinfoMock.mockResolvedValue('userinfoMock Resolve Value');

    getProviderMock.mockReturnValue(getProviderMockReturnValue);
    IssuerProxyMock.discover.mockResolvedValue({
      Client: IssuerClientMock,
    });

    createOidcClientMock.mockResolvedValue({
      authorizationUrl: authorizationUrlMock,
      callbackParams: callbackParamsMock,
      callback: callbackMock,
      userinfo: userinfoMock,
    });

    configServiceMock.get.mockImplementation((module: string) => {
      switch (module) {
        case 'OidcClient':
          return {
            issuer: 'http://foo.bar',
            configuration: {},
            jwks: { keys: [] },
          };
        case 'Logger':
          return {
            path: '/dev/null',
            level: LogLevelNames.TRACE,
            isDevelopment: false,
          };
      }
    });
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should load config', () => {
      // Given
      service['scheduleConfigurationReload'] = jest.fn();
      // When
      service.onModuleInit();
      // Then
      expect(service['scheduleConfigurationReload']).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAuthorizeUrl', () => {
    it('should call authorizationUrl', async () => {
      // Given
      const scope = 'foo_scope bar_scope';
      const providerId = 'myidp';
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const acr_values = 'eidas1';
      service['createOidcClient'] = createOidcClientMock;
      // When
      await service.getAuthorizeUrl(scope, providerId, acr_values);
      // Then
      expect(authorizationUrlMock).toHaveBeenCalledTimes(1);
    });

    it('should resolve to authorizationUrl return value', async () => {
      // Given
      const scope = 'foo_scope bar_scope';
      const providerId = 'myidp';
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const acr_values = 'eidas1';
      service['createOidcClient'] = createOidcClientMock;

      // When
      const result = await service.getAuthorizeUrl(
        scope,
        providerId,
        acr_values,
      );
      // Then
      expect(result).toBe('authorizationUrlMock Resolve Value');
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
        jwks: { keys: ['foo', 'bar'] },
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

  describe('getTokenSet', () => {
    it('should call client.callback with callbackParams', async () => {
      // Given
      const req = {};
      const providerId = 'foo';
      service['getProvider'] = getProviderMock;
      service['createOidcClient'] = createOidcClientMock;
      // When
      await service.getTokenSet(req, providerId);
      // Then
      expect(callbackMock).toHaveBeenCalled();
      expect(callbackMock).toHaveBeenCalledWith(
        'redirect,uris',
        {
          state: 'callbackParamsState',
        },
        {
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          response_type: 'response,types',
          state: 'callbackParamsState',
        },
      );
    });
    it('should retrun resolve value of client.callback', async () => {
      // Given
      const req = { session: { codeVerifier: 'codeVerifierValue' } };
      const providerId = 'foo';
      service['getProvider'] = getProviderMock;
      service['createOidcClient'] = createOidcClientMock;
      // When
      const result = await service.getTokenSet(req, providerId);
      // Then
      expect(result).toBe('callbackMock Resolve Value');
    });
  });

  describe('getUserInfo', () => {
    it('should return client.userinfo result', async () => {
      // Given
      const accessToken = 'accessTokenValue';
      const providerId = 'providerIdValue';
      service['createOidcClient'] = createOidcClientMock;
      // When
      const result = await service.getUserInfo(accessToken, providerId);
      // Then
      expect(result).toBe('userinfoMock Resolve Value');
    });
  });

  describe('scheduleConfigurationReload', () => {
    it('Should call getConfig and overrideConfiguration', async () => {
      // Given
      jest.useFakeTimers();
      // Can't use jest.spyOn() on private
      const getConfigMock = jest
        .fn()
        .mockResolvedValue({ reloadConfigDelayInMs: 1000 });
      service['getConfig'] = getConfigMock;
      // When
      await service['scheduleConfigurationReload']();
      // Then
      expect(getConfigMock).toHaveBeenCalledTimes(1);
    });

    it('shoud call schedule recursive all with setTimeout() and correct reloadConfigDelayInMs', async () => {
      // Given
      jest.useFakeTimers();
      const reloadConfigDelayInMs = 10000;
      const getConfigMock = jest
        .fn()
        .mockResolvedValue({ reloadConfigDelayInMs });
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
  describe('createOidcClient', () => {
    it('should call issuer with url from provider metadata', async () => {
      // Given
      service['getProvider'] = getProviderMock;
      service['IssuerProxy'] = IssuerProxyMock;
      const providerId = 'provider';
      // When
      await service['createOidcClient'](providerId);
      // Then
      expect(getProviderMock).toHaveBeenCalledWith(providerId);
      expect(IssuerProxyMock.discover).toHaveBeenCalledWith(
        getProviderMockReturnValue.discoveryUrl,
      );
    });
  });

  describe('getConfig', () => {
    it('should return data from identity.getList', async () => {
      // When
      const result = await service['getConfig']();
      // Then
      expect(IdentityProviderServiceMock.getList).toHaveBeenCalled();
      expect(result).toHaveProperty('providers');
      expect(result.providers).toBe(
        'IdentityProviderServiceMock Resolve Value',
      );
    });
  });

  describe('getProvider', () => {
    // Given
    const providerMock1 = ({
      name: 'provider1',
      uid: 'p1',
      active: true,
    } as unknown) as ClientMetadata;
    const providerMock2 = ({
      name: 'provider2',
      uid: 'p2',
      active: true,
    } as unknown) as ClientMetadata;
    const providerMock3 = ({
      name: 'provider3',
      uid: 'p3',
      active: true,
    } as unknown) as ClientMetadata;
    const providers = [providerMock1, providerMock2, providerMock3];

    it('should return provider in config', () => {
      // Given
      service['configuration'] = { providers } as OidcClientConfig;
      // When
      const result = service['getProvider']('p2');
      // Then
      expect(result).toBe(providerMock2);
    });
    it('should throw if provider is not in config', () => {
      // Given
      service['configuration'] = { providers } as OidcClientConfig;
      // Then
      expect(() => {
        service['getProvider']('p0');
      }).toThrow(OidcClientProviderNotFoundException);
    });
    it('should throw if provider is not active', () => {
      // Given
      service['configuration'] = { providers } as OidcClientConfig;
      service['configuration'].providers[1].active = false;
      // Then
      expect(() => {
        service['getProvider']('p2');
      }).toThrow(OidcClientProviderDisabledException);
    });
  });
});
