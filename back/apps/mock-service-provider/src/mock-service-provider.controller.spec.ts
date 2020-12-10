import { Test, TestingModule } from '@nestjs/testing';
import { IdentityProviderMetadata, OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { IdentityProviderEnvService } from '@fc/identity-provider-env';
import { MockServiceProviderController } from './mock-service-provider.controller';
import {
  MockServiceProviderTokenRevocationException,
  MockServiceProviderUserinfoException,
} from './exceptions';

describe('MockServiceProviderController', () => {
  let controller: MockServiceProviderController;
  let res;
  let req;

  const oidcClientServiceMock = {
    getAuthorizeUrl: jest.fn(),
    getTokenSet: jest.fn(),
    getUserInfo: jest.fn(),
    wellKnownKeys: jest.fn(),
    buildAuthorizeParameters: jest.fn(),
    revokeToken: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
  } as unknown) as LoggerService;

  const oidcErrorMock = {
    error: 'error',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    error_description: 'error_description',
  };

  const sessionMock = {
    patch: jest.fn(),
    get: jest.fn(),
    init: jest.fn(),
    getId: jest.fn(),
  };

  const randomStringMock = 'randomStringMockValue';
  const stateMock = randomStringMock;
  const nonceMock = randomStringMock;
  const sessionIdMock = randomStringMock;

  const sessionDataMock = {
    idpState: stateMock,
  };

  const cryptographyMock = {
    genRandomString: jest.fn(),
  };

  const configMock = {
    get: jest.fn(),
  };
  const scopeMock = 'openid profile';
  const acrMock = 'acrMock';

  const identityProviderMock = {
    getList: jest.fn(),
  };

  const identityProviderList = [
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uris: ['https://foo.bar.com/buz'],
      uid: 'providerUidMock',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: 'mock client_id',
    },
  ];

  const interactionParametersMock = {
    authorizationUrl: 'authorizationUrl',
    params: {
      state: 'stateMock',
      nonce: 'nonceMock',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MockServiceProviderController],
      providers: [
        OidcClientService,
        LoggerService,
        SessionService,
        CryptographyService,
        ConfigService,
        IdentityProviderEnvService,
      ],
    })
      .overrideProvider(IdentityProviderEnvService)
      .useValue(identityProviderMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .compile();

    controller = module.get<MockServiceProviderController>(
      MockServiceProviderController,
    );

    res = {
      redirect: jest.fn(),
    };

    req = {
      fc: {
        interactionId: 'interactionIdMock',
      },
    };

    jest.resetAllMocks();

    oidcClientServiceMock.buildAuthorizeParameters.mockReturnValue({
      state: stateMock,
      nonce: nonceMock,
      providerUid: 'providerUidMock',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'acrMock',
    });

    sessionMock.get.mockResolvedValue(sessionDataMock);

    sessionMock.getId.mockReturnValue(sessionIdMock);

    cryptographyMock.genRandomString.mockReturnValue(randomStringMock);
    configMock.get.mockReturnValue({ scope: scopeMock, acr: acrMock });
    identityProviderMock.getList.mockResolvedValue(identityProviderList);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    beforeEach(() => {
      controller['getInteractionParameters'] = jest
        .fn()
        .mockResolvedValue(interactionParametersMock);
    });
    it('Should generate a random sessionId of 32 characters', async () => {
      // setup
      sessionMock.init.mockResolvedValueOnce(undefined);

      // action
      const randSize = 32;
      await controller.index(res);

      // assert
      expect(cryptographyMock.genRandomString).toHaveBeenCalledTimes(1);
      expect(cryptographyMock.genRandomString).toHaveBeenCalledWith(randSize);
    });

    it('Should init the session', async () => {
      // setup
      sessionMock.init.mockResolvedValueOnce(undefined);

      // action
      await controller.index(res);

      // assert
      expect(sessionMock.init).toHaveBeenCalledTimes(1);
      expect(sessionMock.init).toHaveBeenCalledWith(res, randomStringMock, {
        idpState: interactionParametersMock.params.state,
        idpNonce: interactionParametersMock.params.nonce,
      });
    });

    it("Should throw if the session can't be initialized", async () => {
      // setup
      sessionMock.init.mockRejectedValueOnce(new Error('test'));

      // expect
      await expect(controller.index(res)).rejects.toThrow();
    });

    it('Should return front title', async () => {
      // setup
      sessionMock.init.mockResolvedValueOnce(undefined);
      // action
      const result = await controller.index(res);
      // assert
      expect(result).toEqual(
        expect.objectContaining({
          titleFront: 'Mock Service Provider',
        }),
      );
    });
  });

  describe('verify', () => {
    it('Should call session.get', async () => {
      // When
      await controller.getVerify(req);
      // Then
      expect(sessionMock.get).toHaveBeenCalledTimes(1);
      expect(sessionMock.get).toHaveBeenCalledWith(randomStringMock);
    });

    it('Should return session data and hardcoded title', async () => {
      // When
      const result = await controller.getVerify(req);
      // Then
      expect(result).toEqual({
        titleFront: 'Mock Service Provider - Login Callback',
        ...sessionDataMock,
      });
    });
  });

  describe('error', () => {
    it('Should return error', async () => {
      // setup
      const queryMock = {
        error: 'error',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        error_description: 'Error description',
      };
      // action
      const result = await controller.error(queryMock);

      // assert
      expect(result).toEqual({
        titleFront: "Mock service provider - Erreur lors de l'authentification",
        error: 'error',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        error_description: 'Error description',
      });
    });
  });

  describe('logout', () => {
    it('should redirect on the logout callback controller', async () => {
      // action
      await controller.logout(res);

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/logout-callback');
    });
  });

  describe('revocationToken', () => {
    it('should display success page when token is revoked', async () => {
      // setup
      const providerUid = 'envIssuer';
      const body = { accessToken: 'access_token' };
      // action
      const result = await controller.revocationToken(res, body);

      // assert
      expect(oidcClientServiceMock.revokeToken).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.revokeToken).toHaveBeenCalledWith(
        body.accessToken,
        providerUid,
      );
      expect(result).toEqual({
        accessToken: 'access_token',
        titleFront: 'Mock Service Provider - Token révoqué',
      });
    });
    it('should redirect to the error page if revokeToken throw an error', async () => {
      // setup
      oidcClientServiceMock.revokeToken.mockRejectedValue(oidcErrorMock);
      const body = { accessToken: 'access_token' };

      // action
      await controller.revocationToken(res, body);

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        '/error?error=error&error_description=error_description',
      );
    });
    it('Should throw mock service provider revoke token exception if error is not an instance of OPError', () => {
      // setup
      const unknowError = { foo: 'bar' };
      const body = { accessToken: 'access_token' };
      oidcClientServiceMock.revokeToken.mockRejectedValue(unknowError);

      // assert
      expect(
        async () => await controller.revocationToken(res, body),
      ).rejects.toThrow(MockServiceProviderTokenRevocationException);
    });
  });

  describe('retrieveUserinfo', () => {
    it('should retrieve and display userinfo on userinfo page', async () => {
      // setup
      const providerUid = 'envIssuer';
      const body = { accessToken: 'access_token' };
      oidcClientServiceMock.getUserInfo.mockReturnValueOnce({
        sub: '1',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        given_name: 'given_name',
      });
      // action
      const result = await controller.retrieveUserinfo(res, body);

      // assert
      expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledWith(
        body.accessToken,
        providerUid,
      );
      expect(result).toEqual({
        accessToken: 'access_token',
        titleFront: 'Mock Service Provider - Userinfo',
        idpIdentity: {
          sub: '1',
          // oidc spec defined property
          // eslint-disable-next-line @typescript-eslint/naming-convention
          given_name: 'given_name',
        },
      });
    });
    it('should redirect to the error page if getUserInfo throw an error', async () => {
      // setup
      const body = { accessToken: 'access_token' };
      oidcClientServiceMock.getUserInfo.mockRejectedValue(oidcErrorMock);

      // action
      await controller.retrieveUserinfo(res, body);

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        '/error?error=error&error_description=error_description',
      );
    });
    it('Should throw mock service provider userinfo exception if error is not an instance of OPError', () => {
      // setup
      oidcClientServiceMock.getUserInfo.mockRejectedValue({});
      const body = { accessToken: 'access_token' };

      // assert
      expect(
        async () => await controller.retrieveUserinfo(res, body),
      ).rejects.toThrow(MockServiceProviderUserinfoException);
    });
  });

  describe('logoutCallback', () => {
    it('should redirect on the home page', async () => {
      // action
      await controller.logoutCallback(res);

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('getInteractionParameters', () => {
    const provider = (identityProviderList[0] as unknown) as IdentityProviderMetadata;
    const urlMock = 'https://somewhere.com/foo';
    beforeEach(() => {
      // Given
      oidcClientServiceMock.getAuthorizeUrl.mockResolvedValue(urlMock);
    });
    it('should call config.get', async () => {
      // When
      await controller['getInteractionParameters'](provider);
      // Then
      expect(configMock.get).toBeCalledTimes(1);
      expect(configMock.get).toBeCalledWith('OidcClient');
    });

    it('should call oidcClient.buildAuthorizeParameters', async () => {
      // When
      await controller['getInteractionParameters'](provider);
      // Then
      expect(oidcClientServiceMock.buildAuthorizeParameters).toBeCalledTimes(1);
    });

    it('should call oidcClient.getAuthorizeUrl', async () => {
      // When
      await controller['getInteractionParameters'](provider);
      // Then
      expect(oidcClientServiceMock.getAuthorizeUrl).toBeCalledTimes(1);
      expect(oidcClientServiceMock.getAuthorizeUrl).toBeCalledWith(
        stateMock,
        scopeMock,
        'providerUidMock',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'acrMock',
        nonceMock,
      );
    });

    it('should return object containing results from various calls', async () => {
      // Given
      const {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        redirect_uris,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_id,
      } = identityProviderList[0];
      // When
      const result = await controller['getInteractionParameters'](provider);
      // Then
      expect(result).toEqual({
        params: {
          state: stateMock,
          nonce: nonceMock,
          uid: 'providerUidMock',
          acr: 'acrMock',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          redirect_uri: redirect_uris[0],
          scope: scopeMock,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          authorization_endpoint: 'https://somewhere.com/foo',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_id,
        },
        authorizationUrl: urlMock,
      });
    });
  });
});
