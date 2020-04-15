import { Test, TestingModule } from '@nestjs/testing';
import { OidcClientService } from './oidc-client.service';
import { ConfigService } from '@fc/config';
import { LoggerService, LogLevelNames } from '@fc/logger';
import { IDP_MANAGEMENT_SERVICE } from './tokens';
import { ClientMetadata } from 'oidc-provider';
import { OidcClientConfig } from './dto';

describe('OidcClientService', () => {
  let service: OidcClientService;

  const configServiceMock = {
    get: (module: string) => {
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
    },
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  const IdPManagementServiceMock = { getList: jest.fn() };
  const authorizationUrlMock = jest.fn();
  const callbackParamsMock = jest.fn();
  const callbackMock = jest.fn();
  const userinfoMock = jest.fn();

  const getProviderMockReturnValue = {
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    redirect_uris: ['redirect', 'uris'],
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    response_types: ['response', 'types'],
    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/camelcase
    well_known_url: 'mock well-known url',
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
          provide: IDP_MANAGEMENT_SERVICE,
          useValue: IdPManagementServiceMock,
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

    IdPManagementServiceMock.getList.mockResolvedValue(
      'IdPManagementServiceMock Resolve Value',
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
      // eslint-disable-next-line @typescript-eslint/camelcase
      const acr_values = 'eidas1';
      const req = { session: {} };
      service['createOidcClient'] = createOidcClientMock;
      // When
      await service.getAuthorizeUrl(scope, providerId, acr_values, req);
      // Then
      expect(authorizationUrlMock).toHaveBeenCalledTimes(1);
    });
    it('should store codeVerifier in session (is not oidc-client suppose to that?)', async () => {
      // Given
      const scope = 'foo_scope bar_scope';
      const providerId = 'myidp';
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/camelcase
      const acr_values = 'eidas1';
      const req = { session: { codeVerifier: undefined } };

      service['createOidcClient'] = createOidcClientMock;
      // When
      await service.getAuthorizeUrl(scope, providerId, acr_values, req);
      // Then
      expect(req.session.codeVerifier).toBeDefined();
    });
    it('should resolve to authorizationUrl return value)', async () => {
      // Given
      const scope = 'foo_scope bar_scope';
      const providerId = 'myidp';
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/camelcase
      const acr_values = 'eidas1';
      const req = { session: {} };
      service['createOidcClient'] = createOidcClientMock;

      // When
      const result = await service.getAuthorizeUrl(
        scope,
        providerId,
        acr_values,
        req,
      );
      // Then
      expect(result).toBe('authorizationUrlMock Resolve Value');
    });
  });

  describe('wellKnownKeys', () => {
    it('should return object with keys', async () => {
      // When
      const result = await service.wellKnownKeys();
      // Then
      expect(result).toEqual(
        expect.objectContaining({
          keys: expect.any(Array),
        }),
      );
    });
  });

  describe('getTokenSet', () => {
    it('should call client.callback with callbackParams', async () => {
      // Given
      const req = { session: { codeVerifier: 'codeVerifierValue' } };
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
          // eslint-disable-next-line @typescript-eslint/camelcase
          code_verifier: 'codeVerifierValue',
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
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
        getProviderMockReturnValue.well_known_url,
      );
    });
  });

  describe('getConfig', () => {
    it('should return data from idpManagement.getList', async () => {
      // When
      const result = await service['getConfig']();
      // Then
      expect(IdPManagementServiceMock.getList).toHaveBeenCalled();
      expect(result).toHaveProperty('providers');
      expect(result.providers).toBe('IdPManagementServiceMock Resolve Value');
    });
  });

  describe('getProvider', () => {
    it('should return provider in config', () => {
      // Given
      const providerMock1 = ({ id: 'provider1' } as unknown) as ClientMetadata;
      const providerMock2 = ({ id: 'provider2' } as unknown) as ClientMetadata;
      const providerMock3 = ({ id: 'provider3' } as unknown) as ClientMetadata;
      service['configuration'] = {
        providers: [providerMock1, providerMock2, providerMock3],
      } as OidcClientConfig;
      // When
      const result = service['getProvider']('provider2');
      // Then
      expect(result).toBe(providerMock2);
    });
    it('should throw if provider is not in config', () => {
      // Given
      const providerMock1 = ({ id: 'provider1' } as unknown) as ClientMetadata;
      const providerMock2 = ({ id: 'provider2' } as unknown) as ClientMetadata;
      const providerMock3 = ({ id: 'provider3' } as unknown) as ClientMetadata;
      service['configuration'] = {
        providers: [providerMock1, providerMock2, providerMock3],
      } as OidcClientConfig;
      // Then
      expect(() => {
        service['getProvider']('provider0');
      }).toThrow();
    });
  });
});
