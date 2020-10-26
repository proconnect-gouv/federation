import { Test, TestingModule } from '@nestjs/testing';
import { JWK } from 'jose';
import { ConfigService } from '@fc/config';
import { LoggerService, LogLevelNames } from '@fc/logger';
import { CryptographyService } from '@fc/cryptography';
import { IDENTITY_PROVIDER_SERVICE } from './tokens';
import { ClientMetadata } from 'oidc-provider';
import { OidcClientConfig } from './dto';
import {
  OidcClientProviderNotFoundException,
  OidcClientProviderDisabledException,
  OidcClientMissingStateException,
  OidcClientMissingCodeException,
  OidcClientInvalidStateException,
  OidcClientRuntimeException,
} from './exceptions';
import { OidcClientService } from './oidc-client.service';

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
  const revokeMock = jest.fn();

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

  const cryptoServiceMock = {
    genRandomString: jest.fn(),
  };

  const randomStringMock = 'randomStringMockValue';

  const IssuerProxyMock = {
    discover: jest.fn(),
  } as any;

  const createOidcClientMock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        LoggerService,
        CryptographyService,
        OidcClientService,
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useValue: IdentityProviderServiceMock,
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptoServiceMock)
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
    callbackParamsMock.mockResolvedValue({
      state: 'callbackParamsState',
      code: 'callbackParamsCode',
    });

    callbackMock.mockResolvedValue('callbackMock Resolve Value');
    userinfoMock.mockResolvedValue('userinfoMock Resolve Value');
    revokeMock.mockResolvedValue(void 0);

    getProviderMock.mockReturnValue(getProviderMockReturnValue);
    IssuerProxyMock.discover.mockResolvedValue({
      Client: IssuerClientMock,
    });

    createOidcClientMock.mockResolvedValue({
      authorizationUrl: authorizationUrlMock,
      callbackParams: callbackParamsMock,
      callback: callbackMock,
      userinfo: userinfoMock,
      revoke: revokeMock,
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

    cryptoServiceMock.genRandomString.mockReturnValue(randomStringMock);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should load config', () => {
      // Given
      service['reloadConfiguration'] = jest.fn();
      // When
      service.onModuleInit();
      // Then
      expect(service['reloadConfiguration']).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAuthorizeUrl', () => {
    it('should call authorizationUrl', async () => {
      // Given
      const state = 'someState';
      const scope = 'foo_scope bar_scope';
      const providerId = 'myidp';
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const acr_values = 'eidas1';
      service['createOidcClient'] = createOidcClientMock;
      // When
      await service.getAuthorizeUrl(state, scope, providerId, acr_values);
      // Then
      expect(authorizationUrlMock).toHaveBeenCalledTimes(1);
    });

    it('should resolve to object containing state & authorizationUrl', async () => {
      // Given
      const state = 'randomStringMock';
      const scope = 'foo_scope bar_scope';
      const providerId = 'myidp';
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const acr_values = 'eidas1';
      service['createOidcClient'] = createOidcClientMock;

      // When
      const url = await service.getAuthorizeUrl(
        state,
        scope,
        providerId,
        acr_values,
      );
      // Then
      expect(state).toEqual('randomStringMock');
      expect(url).toBe('authorizationUrlMock Resolve Value');
    });
  });

  describe('wellKnownKeys', () => {
    it('should return keys', async () => {
      // Given
      const JwkKeyMock = {
        toJWK: jest.fn().mockReturnValueOnce('a').mockReturnValueOnce('b'),
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

  describe('buildAuthorizeParameters', () => {
    // Given
    const params = {
      uid: 'uidMock',
      scope: 'scopeMock',
      providerUid: 'providerMock',
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'acrMock',
    };

    it('should call crypto to generate state', () => {
      // When
      const result = service.buildAuthorizeParameters(params);
      // Then
      expect(result.state).toBeDefined();
      expect(result.state).toBe(randomStringMock);
    });
    it('should return parameters + generated state', () => {
      // When
      const result = service.buildAuthorizeParameters(params);
      // Then
      expect(result).toEqual({
        state: randomStringMock,
        ...params,
      });
    });
  });

  describe('getTokenSet', () => {
    const req = { session: { codeVerifier: 'codeVerifierValue' } };
    const providerId = 'foo';
    const state = 'callbackParamsState';
    beforeEach(() => {
      service['getProvider'] = getProviderMock;
      service['createOidcClient'] = createOidcClientMock;
    });

    it('should call client.callback with callbackParams', async () => {
      // When
      await service.getTokenSet(req, providerId, state);
      // Then
      expect(callbackMock).toHaveBeenCalled();
      expect(callbackMock).toHaveBeenCalledWith(
        'redirect,uris',
        {
          code: 'callbackParamsCode',
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
      // When
      const result = await service.getTokenSet(req, providerId, state);
      // Then
      expect(result).toBe('callbackMock Resolve Value');
    });
    it('should throw if state is not provided in url', async () => {
      // Given
      callbackParamsMock.mockResolvedValueOnce({
        code: 'callbackParamsCode',
      });
      // Then
      expect(service.getTokenSet(req, providerId, state)).rejects.toThrow(
        OidcClientMissingStateException,
      );
    });
    it('should throw if state in url does not match state in session', async () => {
      // Given
      const invalidState = 'notTheSameStateAsInRequest';
      // Then
      expect(
        service.getTokenSet(req, providerId, invalidState),
      ).rejects.toThrow(OidcClientInvalidStateException);
    });
    it('should throw if code is not provided in url', async () => {
      callbackParamsMock.mockResolvedValueOnce({
        state: 'callbackParamsState',
      });
      // Then
      expect(service.getTokenSet(req, providerId, state)).rejects.toThrow(
        OidcClientMissingCodeException,
      );
    });
    it('should throw if something unexpected goes wrong in client.callback', async () => {
      // Given
      const errorMock = new Error('lol');
      callbackMock.mockRejectedValueOnce(errorMock);
      // Then
      expect(service.getTokenSet(req, providerId, state)).rejects.toThrow(
        OidcClientRuntimeException,
      );
    });
  });

  describe('revokeToken', () => {
    it('should call client.revoke', async () => {
      // Given
      const accessToken = 'accessTokenValue';
      const providerId = 'providerIdValue';
      service['getProvider'] = getProviderMock;
      service['createOidcClient'] = createOidcClientMock;
      // When
      await service.revokeToken(accessToken, providerId);
      // Then
      expect(revokeMock).toHaveBeenCalledTimes(1);
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

  describe('reloadConfiguration', () => {
    it('Should call getConfig', async () => {
      // Given
      jest.useFakeTimers();
      // Can't use jest.spyOn() on private
      const getConfigMock = jest.fn();
      service['getConfig'] = getConfigMock;
      // When
      await service['reloadConfiguration']();
      // Then
      expect(getConfigMock).toHaveBeenCalledTimes(1);
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

  describe('getHttpOptions', () => {
    // Given
    const timeoutMock = 42;
    const certMock = 'cert';
    const keyMock = 'key';
    const options = {
      key: keyMock,
      cert: certMock,
      timeout: timeoutMock,
    };

    beforeEach(() => {
      // Given
      service['configuration'] = {
        httpOptions: {
          key: keyMock,
          cert: certMock,
          timeout: timeoutMock,
        },
      } as OidcClientConfig;
    });

    it('Should return key, cert and timeout http options', () => {
      // When
      const result = service['getHttpOptions'](options);

      // Then
      expect(result).toStrictEqual({
        key: keyMock,
        cert: certMock,
        timeout: timeoutMock,
      });
    });
  });

  describe('getHttpTimeout', () => {
    const timeoutMock = 42;
    it('Should return the timeout http options', () => {
      // Given
      const options = {
        timeout: timeoutMock,
      };

      service['configuration'] = {
        httpOptions: options,
      } as OidcClientConfig;

      // When
      const result = service['getHttpTimeout'](options);
      // Then
      expect(result).toStrictEqual({
        timeout: timeoutMock,
      });
    });
  });
});
