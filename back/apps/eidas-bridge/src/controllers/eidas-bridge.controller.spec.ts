import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { OidcProviderService } from '@fc/oidc-provider';
import { EidasBridgeController } from './eidas-bridge.controller';
import { EidasBridgeLoginCallbackException } from '../exceptions';

describe('CoreFcpController', () => {
  let eidasBridgeController: EidasBridgeController;

  const configServiceMock = {
    get: jest.fn(),
  };

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };

  const oidcClientServiceMock = {
    getAuthorizeUrl: jest.fn(),
    getTokenSet: jest.fn(),
    getUserInfo: jest.fn(),
    wellKnownKeys: jest.fn(),
    buildAuthorizeParameters: jest.fn(),
  };

  const oidcProviderServiceMock = {
    getInteraction: jest.fn(),
    finishInteraction: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
  } as unknown) as LoggerService;

  const sessionMock = {
    patch: jest.fn(),
    get: jest.fn(),
    init: jest.fn(),
    getId: jest.fn(),
  };

  const oidcErrorMock = {
    error: 'error',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    error_description: 'error_description',
  };

  const acrMock = 'eidas2';
  const scopeMock = 'scopeMock';
  const providerUidMock = 'providerUidMock';
  const randomStringMock = 'randomStringMockValue';
  const stateMock = randomStringMock;
  const sessionIdMock = randomStringMock;

  const cryptographyMock = {
    genRandomString: jest.fn(),
  };

  const sessionMockValue = {
    spName: Symbol('spNameMockValue'),
  };

  const res = {
    redirect: jest.fn(),
  };

  const req = {
    fc: {
      interactionId: 'interactionIdMock',
    },
    params: {
      uid: '1234456',
    },
  };

  const interactionMock = {
    uid: Symbol('uidMockValue'),
    params: Symbol('paramsMockValue'),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EidasBridgeController],
      providers: [
        ConfigService,
        OidcClientService,
        LoggerService,
        SessionService,
        CryptographyService,
        OidcProviderService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)

      .compile();

    eidasBridgeController = await app.get<EidasBridgeController>(
      EidasBridgeController,
    );

    jest.resetAllMocks();
    configServiceMock.get.mockReturnValue(appConfigMock);

    oidcClientServiceMock.buildAuthorizeParameters.mockReturnValue({
      state: stateMock,
      scope: scopeMock,
      providerUid: providerUidMock,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: acrMock,
    });

    oidcProviderServiceMock.getInteraction.mockResolvedValue(interactionMock);
    sessionMock.get.mockResolvedValue(sessionMockValue);
    sessionMock.getId.mockReturnValue(sessionIdMock);

    cryptographyMock.genRandomString.mockReturnValue(randomStringMock);
  });

  describe('getDefault', () => {
    it('should return Hello Eidas', async () => {
      // When
      const result = await eidasBridgeController.getDefault(res);
      // Then
      expect(result).toEqual({
        message: 'Bienvenue sur le Bridge Eidas',
        state: stateMock,
        titleFront: 'Eidas Bridge',
      });
    });

    it('Should generate a random sessionId of 32 characters', async () => {
      // setup
      sessionMock.init.mockResolvedValueOnce(undefined);

      // action
      const randSize = 32;
      await eidasBridgeController.getDefault(res);

      // assert
      expect(cryptographyMock.genRandomString).toHaveBeenCalledTimes(1);
      expect(cryptographyMock.genRandomString).toHaveBeenCalledWith(randSize);
    });

    it('Should init the session', async () => {
      // setup
      sessionMock.init.mockResolvedValueOnce(undefined);

      // action
      await eidasBridgeController.getDefault(res);

      // assert
      expect(sessionMock.init).toHaveBeenCalledTimes(1);
      expect(sessionMock.init).toHaveBeenCalledWith(res, randomStringMock, {
        idpState: randomStringMock,
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
      sessionMock.patch.mockResolvedValueOnce('randomStringMockValue');

      // action
      await eidasBridgeController.login(req, res);

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
      await eidasBridgeController.login(req, res);

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
      await eidasBridgeController.login(req, res);

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
      await expect(eidasBridgeController.login(req, res)).rejects.toThrow();
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
      const result = await eidasBridgeController.loginCallback(req, res, query);

      // assert
      expect(oidcClientServiceMock.getTokenSet).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledTimes(1);
      expect(oidcClientServiceMock.getUserInfo).toHaveBeenCalledWith(
        accessToken,
        providerUid,
      );

      expect(result).toEqual({
        idpIdentity: {
          sub: '1',
          // oidc spec defined property
          // eslint-disable-next-line @typescript-eslint/naming-convention
          given_name: 'given_name',
        },
        titleFront: 'Eidas Bridge - Login Callback',
      });
    });

    it('Should redirect to the error page if getTokenSet throw an error', async () => {
      // setup
      oidcClientServiceMock.getTokenSet.mockRejectedValue(oidcErrorMock);
      const query = {};

      // action
      await eidasBridgeController.loginCallback(req, res, query);

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
      eidasBridgeController.loginCallback(req, res, query);
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
      await eidasBridgeController.loginCallback(req, res, query);

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
        async () => await eidasBridgeController.loginCallback(req, res, query),
      ).rejects.toThrow(EidasBridgeLoginCallbackException);
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
      const result = await eidasBridgeController.error(queryMock);

      // assert
      expect(result).toEqual({
        titleFront: "Eidas Bridge - Erreur lors de l'authentification",
        error: 'error',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        error_description: 'Error description',
      });
    });
  });

  describe('getInteraction', () => {
    it('should call oidcProvider.getInteraction', async () => {
      // When
      await eidasBridgeController.getInteraction(req, res);
      // Then
      expect(oidcProviderServiceMock.getInteraction).toBeCalledTimes(1);
      expect(oidcProviderServiceMock.getInteraction).toBeCalledWith(req, res);
    });

    it('should call session.get with interactionId', async () => {
      // When
      await eidasBridgeController.getInteraction(req, res);
      // Then
      expect(sessionMock.get).toBeCalledTimes(1);
      expect(sessionMock.get).toBeCalledWith(req.fc.interactionId);
    });

    it('should return an object with data from session and oidcProvider interaction', async () => {
      // When
      const result = await eidasBridgeController.getInteraction(req, res);
      // Then
      expect(result).toEqual({
        uid: interactionMock.uid,
        params: interactionMock.params,
        spName: sessionMockValue.spName,
      });
    });
  });

  describe('getLogin', () => {
    it('should call crypto.getRandomString() and pass it to session', async () => {
      // Given
      const randomStringMock = 'randomStringMockValue';
      cryptographyMock.genRandomString.mockReturnValue(randomStringMock);

      const accountMock = {
        sub:
          'b155a2129530e5fd3f6b95275b6da72a99ea1a486b8b33148abb4a62ddfb3609v2',
        gender: 'female',
        birthdate: '1962-08-24',
        birthcountry: '99100',
        birthplace: '75107',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        given_name: 'Angela Claire Louise',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        family_name: 'DUBOIS',
        address: {
          country: 'France',
          formatted: 'France Paris 75107 20 avenue de Ségur',
          locality: 'Paris',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          postal_code: '75107',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          street_address: '20 avenue de Ségur',
        },
        aud: 'myclientidforeidas-bridge',
        exp: 1605004505,
        iat: 1605004445,
        iss: 'https://corev2.docker.dev-franceconnect.fr/api/v2',
      };

      // When
      await eidasBridgeController.getLogin(req, res, req.params);

      // Then
      expect(cryptographyMock.genRandomString).toHaveBeenCalledTimes(1);
      expect(sessionMock.init).toHaveBeenCalledTimes(1);
      expect(sessionMock.init).toHaveBeenCalledWith(res, req.params.uid, {
        sessionId: randomStringMock,
        spIdentity: accountMock,
      });
    });

    it('should call oidcProvider.finishInteraction', async () => {
      // Given
      const acrMock = 'eidas2';
      // When
      await eidasBridgeController.getLogin(req, res, req.params);
      // Then
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledWith(
        req,
        res,
        expect.objectContaining({
          login: {
            account: req.params.uid,
            acr: acrMock,
            ts: expect.any(Number),
          },
          consent: {
            rejectedScopes: [],
            rejectedClaims: [],
          },
        }),
      );
    });
  });
});
