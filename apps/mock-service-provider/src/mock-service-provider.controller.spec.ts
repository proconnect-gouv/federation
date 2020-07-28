import { Test, TestingModule } from '@nestjs/testing';
import { OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CryptographyService } from '@fc/cryptography';
import { MockServiceProviderController } from './mock-service-provider.controller';
import { MockServiceProviderLoginCallbackException } from './exceptions';

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
    it('Should return front title', async () => {
      // action
      const result = await controller.index(req);

      // assert
      expect(result).toEqual({
        titleFront: 'Mock Service Provider',
        state: stateMock,
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

      // action
      await controller.login(req, res);

      // assert
      expect(oidcClientServiceMock.getAuthorizeUrl).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(mockedoidcClientService);
    });
  });

  describe('loginCallback', () => {
    it('Should call oidc-client-service for retrieve authorize url', async () => {
      // setup
      const accessToken = 'accest_token';
      const providerUid = 'corev2';
      const query = {};
      oidcClientServiceMock.getTokenSet.mockReturnValueOnce({
        // oidc spec defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        access_token: 'accest_token',
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
        titleFront: 'Mock Service Provider - Login Callback',
        idpIdentity: {
          sub: '1',
          // oidc spec defined property
          // eslint-disable-next-line @typescript-eslint/naming-convention
          given_name: 'given_name',
        },
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
        access_token: 'accest_token',
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
