import { Test, TestingModule } from '@nestjs/testing';
import { JWK } from 'jose';
import { LoggerService } from '@fc/logger';
import { CryptographyService } from '@fc/cryptography';
import {
  OidcClientMissingStateException,
  OidcClientMissingCodeException,
  OidcClientInvalidStateException,
  OidcClientRuntimeException,
} from '../exceptions';
import { OidcClientConfigService } from './oidc-client-config.service';
import { OidcClientIssuerService } from './oidc-client-issuer.service';
import { OidcClientService } from './oidc-client.service';

describe('OidcClientService', () => {
  let service: OidcClientService;

  const loggerServiceMock = ({
    setContext: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  const IdentityProviderServiceMock = { getList: jest.fn() };

  const IssuerClientMock = jest.fn();
  const cryptoServiceMock = {
    genRandomString: jest.fn(),
  };

  const randomStringMock = 'randomStringMockValue';

  const IssuerProxyMock = {
    discover: jest.fn(),
  } as any;

  const oidcClientIssuerServiceMock = {
    getClient: jest.fn(),
  };

  const oidcClientConfigServiceMock = {
    get: jest.fn(),
    reload: jest.fn(),
  };

  const authorizationUrlMock = jest.fn();
  const callbackParamsMock = jest.fn();
  const callbackMock = jest.fn();
  const userinfoMock = jest.fn();
  const revokeMock = jest.fn();
  const clientMock = {
    authorizationUrl: authorizationUrlMock,
    callbackParams: callbackParamsMock,
    callback: callbackMock,
    userinfo: userinfoMock,
    revoke: revokeMock,
    metadata: {
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uris: ['redirect', 'uris'],
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      response_types: ['response', 'types'],
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      discoveryUrl: 'mock well-known url',
    },
  };

  const createOidcClientMock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        CryptographyService,
        OidcClientConfigService,
        OidcClientIssuerService,
        OidcClientService,
      ],
    })
      .overrideProvider(OidcClientIssuerService)
      .useValue(oidcClientIssuerServiceMock)
      .overrideProvider(OidcClientConfigService)
      .useValue(oidcClientConfigServiceMock)
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

    IssuerProxyMock.discover.mockResolvedValue({
      Client: IssuerClientMock,
    });

    oidcClientIssuerServiceMock.getClient.mockResolvedValue(clientMock);

    oidcClientConfigServiceMock.get.mockResolvedValue({
      issuer: 'http://foo.bar',
      configuration: {},
      jwks: { keys: [] },
    });

    cryptoServiceMock.genRandomString.mockReturnValue(randomStringMock);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getAuthorizeUrl', () => {
    it('should call authorizationUrl', async () => {
      // Given
      const state = 'someState';
      const nonce = 'someNonce';
      const scope = 'foo_scope bar_scope';
      const providerId = 'myidp';
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const acr_values = 'eidas1';
      service['createOidcClient'] = createOidcClientMock;
      // When
      await service.getAuthorizeUrl(
        state,
        nonce,
        scope,
        providerId,
        acr_values,
      );
      // Then
      expect(authorizationUrlMock).toHaveBeenCalledTimes(1);
    });

    it('should resolve to object containing state & authorizationUrl', async () => {
      // Given
      const state = 'randomStateMock';
      const nonce = 'randomNonceMock';
      const scope = 'foo_scope bar_scope';
      const providerId = 'myidp';
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const acr_values = 'eidas1';
      service['createOidcClient'] = createOidcClientMock;

      // When
      const url = await service.getAuthorizeUrl(
        state,
        nonce,
        scope,
        providerId,
        acr_values,
      );
      // Then
      expect(state).toEqual('randomStateMock');
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

      oidcClientConfigServiceMock.get.mockReturnValueOnce({
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

    it('should call crypto to generate state', async () => {
      // When
      const result = await service.buildAuthorizeParameters(params);
      // Then
      expect(result.state).toBeDefined();
      expect(result.state).toBe(randomStringMock);
    });
    it('should return parameters + generated state', async () => {
      // When
      const result = await service.buildAuthorizeParameters(params);
      // Then
      expect(result).toEqual({
        state: randomStringMock,
        nonce: randomStringMock,
        ...params,
      });
    });
  });

  describe('getTokenSet', () => {
    const req = { session: { codeVerifier: 'codeVerifierValue' } };
    const providerId = 'foo';
    const state = 'callbackParamsState';
    const nonce = 'callbackParamsNonce';

    it('should call client.callback with callbackParams', async () => {
      // When
      await service.getTokenSet(req, providerId, state, nonce);
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
          nonce: 'callbackParamsNonce',
        },
      );
    });
    it('should retrun resolve value of client.callback', async () => {
      // When
      const result = await service.getTokenSet(req, providerId, state, nonce);
      // Then
      expect(result).toBe('callbackMock Resolve Value');
    });
    it('should throw if state is not provided in url', async () => {
      // Given
      callbackParamsMock.mockResolvedValueOnce({
        code: 'callbackParamsCode',
      });
      // Then
      expect(
        service.getTokenSet(req, providerId, state, nonce),
      ).rejects.toThrow(OidcClientMissingStateException);
    });
    it('should throw if state in url does not match state in session', async () => {
      // Given
      const invalidState = 'notTheSameStateAsInRequest';
      // Then
      expect(
        service.getTokenSet(req, providerId, invalidState, nonce),
      ).rejects.toThrow(OidcClientInvalidStateException);
    });
    it('should throw if code is not provided in url', async () => {
      callbackParamsMock.mockResolvedValueOnce({
        state: 'callbackParamsState',
      });
      // Then
      expect(
        service.getTokenSet(req, providerId, state, nonce),
      ).rejects.toThrow(OidcClientMissingCodeException);
    });
    it('should throw if something unexpected goes wrong in client.callback', async () => {
      // Given
      const errorMock = new Error('lol');
      callbackMock.mockRejectedValueOnce(errorMock);
      // Then
      expect(
        service.getTokenSet(req, providerId, state, nonce),
      ).rejects.toThrow(OidcClientRuntimeException);
    });
  });

  describe('revokeToken', () => {
    it('should call client.revoke', async () => {
      // Given
      const accessToken = 'accessTokenValue';
      const providerId = 'providerIdValue';
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
    it('should call config.reload', async () => {
      // When
      await service.reloadConfiguration();
      // Then
      expect(oidcClientConfigServiceMock.reload).toHaveBeenCalledTimes(1);
    });
  });
});
