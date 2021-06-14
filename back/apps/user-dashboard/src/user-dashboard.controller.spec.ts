import { Test, TestingModule } from '@nestjs/testing';
import { OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionGenericService } from '@fc/session-generic';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import { UserDashboardController } from './user-dashboard.controller';
import {
  UserDashboardTokenRevocationException,
  UserDashboardUserinfoException,
} from './exceptions';
import { OidcSession } from '@fc/oidc';

describe('UserDashboardController', () => {
  let controller: UserDashboardController;
  let res;
  let req;

  const oidcClientServiceMock = {
    utils: {
      getAuthorizeUrl: jest.fn(),
      getTokenSet: jest.fn(),
      getUserInfo: jest.fn(),
      wellKnownKeys: jest.fn(),
      buildAuthorizeParameters: jest.fn(),
      revokeToken: jest.fn(),
    },
    getTokenFromProvider: jest.fn(),
    getUserInfosFromProvider: jest.fn(),
  };

  const loggerServiceMock = {
    setContext: jest.fn(),
  } as unknown as LoggerService;

  const oidcErrorMock = {
    error: 'error',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    error_description: 'error_description',
  };

  const sessionServiceMock = {
    set: jest.fn(),
    get: jest.fn(),
  };

  const interactionIdMock = 'interactionIdMockValue';
  const randomStringMock = 'randomStringMockValue';
  const sessionIdMock = randomStringMock;
  const idpStateMock = 'idpStateMockValue';
  const idpNonceMock = 'idpNonceMock';

  const cryptographyMock = {
    genRandomString: jest.fn(),
  };

  const sessionInitMock: OidcSession = {
    sessionId: randomStringMock,
    idpState: randomStringMock,
  };

  const configMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDashboardController],
      providers: [
        ConfigService,
        OidcClientService,
        LoggerService,
        SessionGenericService,
        CryptographyService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionGenericService)
      .useValue(sessionServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyMock)
      .compile();

    controller = module.get<UserDashboardController>(UserDashboardController);

    res = {
      redirect: jest.fn(),
    };

    req = {
      fc: {
        interactionId: interactionIdMock,
      },
    };

    oidcClientServiceMock.utils.buildAuthorizeParameters.mockReturnValue({
      state: idpStateMock,
      scope: 'scopeMock',
      providerUid: 'providerUidMock',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'acrMock',
    });

    sessionServiceMock.get.mockResolvedValue({
      idpState: idpStateMock,
      idpNonce: idpNonceMock,
      interactionId: interactionIdMock,
    });

    configMock.get.mockReturnValueOnce({
      urlPrefix: '/api/v2',
    });
    cryptographyMock.genRandomString.mockReturnValue(randomStringMock);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index()', () => {
    it('Should generate a random sessionId of 32 characters', async () => {
      // setup
      sessionServiceMock.set.mockResolvedValueOnce(undefined);

      // action
      const randSize = 32;
      await controller.index(sessionServiceMock);

      // assert
      expect(cryptographyMock.genRandomString).toHaveBeenCalledTimes(1);
      expect(cryptographyMock.genRandomString).toHaveBeenCalledWith(randSize);
    });

    it('Should init the session', async () => {
      // setup
      sessionServiceMock.set.mockResolvedValueOnce(undefined);

      // action
      await controller.index(sessionServiceMock);

      // assert
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith(sessionInitMock);
    });

    it("Should throw if the session can't be initialized", async () => {
      // setup
      sessionServiceMock.set.mockRejectedValueOnce(new Error('test'));

      // expect
      await expect(controller.index(sessionServiceMock)).rejects.toThrow();
    });

    it('Should return front title', async () => {
      // setup
      sessionServiceMock.set.mockResolvedValueOnce(undefined);

      // action
      const result = await controller.index(sessionServiceMock);

      // assert
      expect(result).toEqual({
        titleFront: 'Mock Service Provider',
        state: sessionIdMock,
      });
    });
  });

  describe('getVerify()', () => {
    it('Should call session.get', async () => {
      // When
      await controller.getVerify(sessionServiceMock);
      // Then
      expect(sessionServiceMock.get).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.get).toHaveBeenCalledWith();
    });

    // Temporary behaviour
    it('Should return identity from session', async () => {
      // Given
      const sessionDataMock = {
        idpIdentity: Symbol('idpIdentity'),
      };
      sessionServiceMock.get.mockResolvedValue(sessionDataMock);
      // When
      const result = await controller.getVerify(sessionServiceMock);
      // Then
      expect(result).toEqual({ idpIdentity: sessionDataMock.idpIdentity });
      expect(result.idpIdentity).toBe(sessionDataMock.idpIdentity);
    });
  });

  describe('error()', () => {
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

  describe('logout()', () => {
    it('should redirect on the logout callback controller', async () => {
      // action
      await controller.logout(res);

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/logout-callback');
    });
  });

  describe('revocationToken()', () => {
    it('should display success page when token is revoked', async () => {
      // setup
      const providerUid = 'core-fcp-high';
      const body = { accessToken: 'access_token' };
      // action
      const result = await controller.revocationToken(res, body);

      // assert
      expect(oidcClientServiceMock.utils.revokeToken).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.utils.revokeToken).toHaveBeenCalledWith(
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
      oidcClientServiceMock.utils.revokeToken.mockRejectedValue(oidcErrorMock);
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
      oidcClientServiceMock.utils.revokeToken.mockRejectedValue(unknowError);

      // assert
      expect(
        async () => await controller.revocationToken(res, body),
      ).rejects.toThrow(UserDashboardTokenRevocationException);
    });
  });

  describe('retrieveUserinfo()', () => {
    it('should retrieve and display userinfo on userinfo page', async () => {
      // setup
      const providerUid = 'core-fcp-high';
      const body = { accessToken: 'access_token' };
      oidcClientServiceMock.utils.getUserInfo.mockReturnValueOnce({
        sub: '1',
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        given_name: 'given_name',
      });
      // action
      const result = await controller.retrieveUserinfo(res, body);

      // assert
      expect(oidcClientServiceMock.utils.getUserInfo).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.utils.getUserInfo).toHaveBeenCalledWith(
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
      oidcClientServiceMock.utils.getUserInfo.mockRejectedValue(oidcErrorMock);

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
      oidcClientServiceMock.utils.getUserInfo.mockRejectedValue({});
      const body = { accessToken: 'access_token' };

      // assert
      expect(
        async () => await controller.retrieveUserinfo(res, body),
      ).rejects.toThrow(UserDashboardUserinfoException);
    });
  });

  describe('logoutCallback()', () => {
    it('should redirect on the home page', async () => {
      // action
      await controller.logoutCallback(res);

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('getOidcCallback()', () => {
    const accessTokenMock = Symbol('accesToken');
    const acrMock = Symbol('acr');
    const providerUid = 'providerUidMock';
    const identityMock = {
      sub: '1',
      // oidc spec defined property
      // eslint-disable-next-line @typescript-eslint/naming-convention
      given_name: 'given_name',
    };

    const tokenParamsMock = {
      providerUid,
      idpState: idpStateMock,
      idpNonce: idpNonceMock,
    };

    const userInfoParamsMock = {
      accessToken: accessTokenMock,
      providerUid,
    };

    const identityExchangeMock = {
      idpIdentity: identityMock,
      idpAcr: acrMock,
      idpAccessToken: accessTokenMock,
    };

    const redirectMock = `/api/v2/interaction/${interactionIdMock}/verify`;

    beforeEach(() => {
      res = {
        redirect: jest.fn(),
      };

      oidcClientServiceMock.getTokenFromProvider.mockReturnValueOnce({
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        accessToken: accessTokenMock,
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr: acrMock,
      });
      oidcClientServiceMock.getUserInfosFromProvider.mockReturnValueOnce(
        identityMock,
      );
    });

    it('should call token with providerId', async () => {
      // action
      await controller.getOidcCallback(
        req,
        res,
        {
          providerUid,
        },
        sessionServiceMock,
      );

      // assert
      expect(oidcClientServiceMock.getTokenFromProvider).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcClientServiceMock.getTokenFromProvider).toHaveBeenCalledWith(
        tokenParamsMock,
        req,
      );
    });

    it('should call userinfo with acesstoken, dto and context', async () => {
      // arrange

      // action
      await controller.getOidcCallback(
        req,
        res,
        {
          providerUid,
        },
        sessionServiceMock,
      );

      // assert
      expect(
        oidcClientServiceMock.getUserInfosFromProvider,
      ).toHaveBeenCalledTimes(1);
      expect(
        oidcClientServiceMock.getUserInfosFromProvider,
      ).toHaveBeenCalledWith(userInfoParamsMock, req);
    });

    it('should set session with identity result.', async () => {
      // action
      await controller.getOidcCallback(
        req,
        res,
        {
          providerUid,
        },
        sessionServiceMock,
      );

      // assert
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith(identityExchangeMock);
    });

    it('should redirect user after token and userinfo received and saved', async () => {
      // action
      await controller.getOidcCallback(
        req,
        res,
        {
          providerUid,
        },
        sessionServiceMock,
      );

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(redirectMock);
    });
  });
});
