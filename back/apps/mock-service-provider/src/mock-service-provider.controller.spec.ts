import { Test, TestingModule } from '@nestjs/testing';
import { OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CryptographyService } from '@fc/cryptography';
import { MockServiceProviderController } from './mock-service-provider.controller';
import {
  MockServiceProviderLoginCallbackException,
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
  const sessionIdMock = randomStringMock;

  const cryptographyMock = {
    genRandomString: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MockServiceProviderController],
      providers: [
        OidcClientService,
        LoggerService,
        SessionService,
        CryptographyService,
      ],
    })
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyMock)
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
      scope: 'scopeMock',
      providerUid: 'providerUidMock',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'acrMock',
    });

    sessionMock.get.mockResolvedValue({
      idpState: stateMock,
    });

    sessionMock.getId.mockReturnValue(sessionIdMock);

    cryptographyMock.genRandomString.mockReturnValue(randomStringMock);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
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
        idpState: randomStringMock,
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
      const authorizationUrl = '';
      const scopes =
        'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address phone';
      const redirectUri =
        'https://fsp1v2.docker.dev-franceconnect.fr/login-callback';
      const acrValues = 'eidas2';
      const clientId = undefined;
      //'6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950';

      // action
      const result = await controller.index(res);

      // assert
      expect(result).toEqual({
        titleFront: 'Mock Service Provider',
        state: stateMock,

        authorizationUrl,
        scopes,
        redirectUri,
        acrValues,
        clientId,
      });
    });
  });

  describe('login', () => {
    it('Should call oidc-client-service for retrieve authorize url', async () => {
      // setup
      const mockedoidcClientService =
        'https://my-authentication-openid-url.com';

      oidcClientServiceMock.getAuthorizeUrl.mockReturnValueOnce(
        mockedoidcClientService,
      );
      sessionMock.patch.mockResolvedValueOnce(undefined);

      // action
      await controller.login(req, res);

      // assert
      expect(oidcClientServiceMock.getAuthorizeUrl).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(mockedoidcClientService);
    });

    it('Should get the session id', async () => {
      // setup
      const mockedoidcClientService =
        'https://my-authentication-openid-url.com';

      oidcClientServiceMock.getAuthorizeUrl.mockReturnValueOnce(
        mockedoidcClientService,
      );
      sessionMock.patch.mockResolvedValueOnce(undefined);

      // action
      await controller.login(req, res);

      // assert
      expect(sessionMock.getId).toHaveBeenCalledTimes(1);
      expect(sessionMock.getId).toHaveBeenCalledWith(req);
    });

    it('Should patch the session', async () => {
      // setup
      const mockedoidcClientService =
        'https://my-authentication-openid-url.com';

      oidcClientServiceMock.getAuthorizeUrl.mockReturnValueOnce(
        mockedoidcClientService,
      );
      sessionMock.patch.mockResolvedValueOnce(undefined);

      // action
      await controller.login(req, res);

      // assert
      expect(sessionMock.patch).toHaveBeenCalledTimes(1);
      expect(sessionMock.patch).toHaveBeenCalledWith(sessionIdMock, {
        idpState: stateMock,
      });
    });

    it("Should throw if the session can't be patched", async () => {
      // setup
      const mockedoidcClientService =
        'https://my-authentication-openid-url.com';

      oidcClientServiceMock.getAuthorizeUrl.mockReturnValueOnce(
        mockedoidcClientService,
      );
      sessionMock.patch.mockRejectedValueOnce(new Error('test'));

      // assert
      await expect(controller.login(req, res)).rejects.toThrow();
    });
  });

  describe('loginCallback', () => {
    it('Should call oidc-client-service for retrieve authorize url', async () => {
      // setup
      const accessToken = 'access_token';
      const providerUid = 'corev2';
      const query = {};
      oidcClientServiceMock.getTokenSet.mockReturnValueOnce({
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        access_token: 'access_token',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        id_token: 'id_token',
        claims: jest.fn().mockReturnValueOnce({ acr: 'foo' }),
      });
      oidcClientServiceMock.getUserInfo.mockReturnValueOnce({
        sub: '1',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        given_name: 'given_name',
      });

      // action
      const result = await controller.loginCallback(req, res, query);

      // assert
      expect(oidcClientServiceMock.getTokenSet).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.getTokenSet).toHaveBeenCalledWith(
        req,
        providerUid,
        stateMock,
      );
      expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledWith(
        accessToken,
        providerUid,
      );

      expect(result).toEqual({
        accessToken: 'access_token',
        titleFront: 'Mock Service Provider - Login Callback',
        idpIdentity: {
          sub: '1',
          // oidc spec defined property
          // eslint-disable-next-line @typescript-eslint/naming-convention
          given_name: 'given_name',
        },
        acr: 'foo',
      });
    });

    it('Should redirect to the error page if getTokenSet throw an error', async () => {
      // setup
      oidcClientServiceMock.getTokenSet.mockRejectedValue(oidcErrorMock);
      const query = {};

      // action
      await controller.loginCallback(req, res, query);

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        '/error?error=error&error_description=error_description',
      );
    });

    it('should redirect to the error page if error params are in the callback url', async () => {
      // Given
      const query = {
        error: 'some_error',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        error_description: 'some error description',
      };
      // When
      controller.loginCallback(req, res, query);
      // Then
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        '/error?error=some_error&error_description=some error description',
      );
    });

    it('Should redirect to the error page if getUserInfo throw an error', async () => {
      // setup
      oidcClientServiceMock.getTokenSet.mockReturnValueOnce({
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        access_token: 'access_token',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        id_token: 'id_token',
        claims: jest.fn().mockReturnValueOnce({ acr: 'foo' }),
      });
      oidcClientServiceMock.getUserInfo.mockRejectedValue(oidcErrorMock);
      const query = {};

      // action
      await controller.loginCallback(req, res, query);

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        '/error?error=error&error_description=error_description',
      );
    });

    it('Should throw mock service provider exception if error is not an instance of OPError', () => {
      // setup
      oidcClientServiceMock.getTokenSet.mockRejectedValue({});
      const query = {};

      // assert
      expect(
        async () => await controller.loginCallback(req, res, query),
      ).rejects.toThrow(MockServiceProviderLoginCallbackException);
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
      const providerUid = 'corev2';
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
      const providerUid = 'corev2';
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
});
