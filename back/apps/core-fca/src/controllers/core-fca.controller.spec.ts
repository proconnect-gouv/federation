import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { IdentityProviderService } from '@fc/identity-provider';
import { ServiceProviderService } from '@fc/service-provider';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { CoreMissingIdentityException } from '@fc/core';
import { MinistriesService } from '@fc/ministries';
import { OidcClientService } from '@fc/oidc-client';
import { CoreFcaService } from '../services';
import { CoreFcaController } from './core-fca.controller';

describe('CoreFcaController', () => {
  let coreController: CoreFcaController;

  const params = { uid: 'abcdefghijklmnopqrstuvwxyz0123456789' };
  const interactionIdMock = 'interactionIdMockValue';
  const acrMock = 'acrMockValue';
  const spNameMock = 'some SP';
  const idpStateMock = 'idpStateMockValue';
  const idpNonceMock = 'idpNonceMock';

  const req = {
    fc: {
      interactionId: interactionIdMock,
    },
  };

  const interactionDetailsResolved = {
    uid: Symbol('uid'),
    prompt: Symbol('prompt'),
    params: {
      scope: 'toto titi',
    },
  };
  const interactionFinishedValue = Symbol('interactionFinishedValue');
  const providerMock = {
    interactionDetails: jest.fn(),
    interactionFinished: jest.fn(),
  };

  const oidcProviderServiceMock = {
    getInteraction: jest.fn(),
    finishInteraction: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  } as unknown) as LoggerService;

  const coreServiceMock = {
    getConsent: jest.fn(),
    verify: jest.fn(),
  };

  const ministriesServiceMock = {
    getList: jest.fn(),
  };

  const identityProviderServiceMock = {
    getList: jest.fn(),
    getFilteredList: jest.fn(),
  };

  const serviceProviderServiceMock = {
    getById: jest.fn(),
  };

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
  };

  const randomStringMock = 'randomStringMockValue';
  const cryptographyServiceMock = {
    genRandomString: jest.fn(),
  };

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };
  const configServiceMock = {
    get: jest.fn(),
  };

  const oidcClientServiceMock = {
    utils: {
      checkIdpBlacklisted: jest.fn(),
    },
    getTokenFromProvider: jest.fn(),
    getUserInfosFromProvider: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoreFcaController],
      providers: [
        LoggerService,
        OidcProviderService,
        MinistriesService,
        CoreFcaService,
        IdentityProviderService,
        ServiceProviderService,
        SessionService,
        ConfigService,
        OidcClientService,
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(MinistriesService)
      .useValue(ministriesServiceMock)
      .overrideProvider(CoreFcaService)
      .useValue(coreServiceMock)
      .overrideProvider(IdentityProviderService)
      .useValue(identityProviderServiceMock)
      .overrideProvider(ServiceProviderService)
      .useValue(serviceProviderServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .compile();

    coreController = await app.get<CoreFcaController>(CoreFcaController);

    jest.resetAllMocks();
    jest.restoreAllMocks();

    providerMock.interactionDetails.mockResolvedValue(
      interactionDetailsResolved,
    );
    oidcProviderServiceMock.finishInteraction.mockReturnValue(
      interactionFinishedValue,
    );
    oidcProviderServiceMock.getInteraction.mockResolvedValue(
      interactionDetailsResolved,
    );
    coreServiceMock.verify.mockResolvedValue(interactionDetailsResolved);
    serviceProviderServiceMock.getById.mockResolvedValue({
      name: spNameMock,
    });
    sessionServiceMock.get.mockResolvedValue({
      interactionId: interactionIdMock,
      spAcr: acrMock,
      spIdentity: {},
      spName: spNameMock,
      csrfToken: randomStringMock,
      idpState: idpStateMock,
      idpNonce: idpNonceMock,
    });

    sessionServiceMock.patch.mockResolvedValueOnce(undefined);
    cryptographyServiceMock.genRandomString.mockReturnValue(randomStringMock);
    configServiceMock.get.mockReturnValue(appConfigMock);
  });

  describe('getDefault', () => {
    it('should redirect to configured url', () => {
      // Given
      const configuredValueMock = 'fooBar';
      configServiceMock.get.mockReturnValue({
        defaultRedirectUri: configuredValueMock,
      });
      const resMock = {
        redirect: jest.fn(),
      };
      // When
      coreController.getDefault(resMock);
      // Then
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('Core');
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(resMock.redirect).toHaveBeenCalledWith(301, configuredValueMock);
    });
  });

  describe('getFrontData', () => {
    // Given
    const res = {
      json: jest.fn(),
    };
    const idps = [
      { active: true, display: true, title: 'toto', uid: '12345' },
      { active: true, display: true, title: 'tata', uid: '12354' },
    ];
    const ministries = [
      {
        id: 'mock-ministry-id',
        name: 'mocked ministry',
        identityProviders: ['12345'],
      },
    ];

    beforeEach(() => {
      oidcProviderServiceMock.getInteraction.mockResolvedValueOnce({
        params: {
          // Oidc name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          acr_values: 'eidas2',
          // Oidc name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          redirect_uri: 'https://youre-redirected',
          // Oidc name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          response_type: 'success',
        },
      });

      ministriesServiceMock.getList.mockResolvedValueOnce(ministries);
      identityProviderServiceMock.getFilteredList.mockResolvedValueOnce(idps);
    });

    it('should call oidcProvider.getInteraction', async () => {
      // Given
      jest.spyOn(oidcProviderServiceMock, 'getInteraction');
      // When
      await coreController.getFrontData(req, res);

      // Then
      expect(oidcProviderServiceMock.getInteraction).toHaveBeenCalledTimes(1);
      expect(oidcProviderServiceMock.getInteraction).toHaveBeenCalledWith(
        req,
        res,
      );
    });
    it('should call config.get', async () => {
      // Given
      jest.spyOn(configServiceMock, 'get');
      // When
      await coreController.getFrontData(req, res);

      // Then
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('OidcClient');
    });
    it('should call identityProviderGetFilteredList', async () => {
      // When
      await coreController.getFrontData(req, res);

      // Then
      expect(identityProviderServiceMock.getFilteredList).toHaveBeenCalledTimes(
        1,
      );
    });
    it('should call session.get', async () => {
      // When
      await coreController.getFrontData(req, res);

      // Then
      expect(sessionServiceMock.get).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.get).toHaveBeenCalledWith(req.fc.interactionId);
    });
    it('should call res.json', async () => {
      // When
      await coreController.getFrontData(req, res);

      // Then
      expect(res.json).toHaveBeenCalledTimes(1);
    });
    it('should return object containing needed data', async () => {
      // When
      await coreController.getFrontData(req, res);
      // Then
      const expected = expect.objectContaining({
        redirectToIdentityProviderInputs: expect.any(Object),
        redirectURL: expect.any(String),
        ministries: expect.any(Array),
        identityProviders: expect.any(Array),
        serviceProviderName: expect.any(String),
      });
      expect(res.json).toHaveBeenCalledWith(expected);
    });
  });

  describe('getInteraction', () => {
    it('should return empty object', async () => {
      // Given
      oidcProviderServiceMock.getInteraction.mockResolvedValue({
        uid: 'uid',
        prompt: 'prompt',
        params: 'params',
      });
      // When
      const result = await coreController.getInteraction();
      // Then
      expect(result).toEqual({});
    });
  });

  describe('getVerify', () => {
    it('should call coreService', async () => {
      // Given
      const res = {
        redirect: jest.fn(),
      };
      // When
      await coreController.getVerify(req, res, params);
      // Then
      expect(coreServiceMock.verify).toHaveBeenCalledTimes(1);
    });
    it('should redirect to /login URL', async () => {
      // Given
      const res = {
        redirect: jest.fn(),
      };
      // When
      await coreController.getVerify(req, res, params);
      // Then
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(`/api/v2/login`);
    });
  });

  describe('getLogin', () => {
    it('should throw an exception if no identity in session', async () => {
      // Given
      const next = jest.fn();
      sessionServiceMock.get.mockResolvedValue({
        interactionId: interactionIdMock,
        spAcr: acrMock,
        spName: spNameMock,
        csrfToken: randomStringMock,
      });
      // Then
      expect(coreController.getLogin(req, next)).rejects.toThrow(
        CoreMissingIdentityException,
      );
    });

    it('should call next', async () => {
      // Given
      const res = {};
      // When
      await coreController.getLogin(req, res);
      // Then
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledWith(
        req,
        res,
      );
    });
    it('should return result from controller.oidcProvider.finishInteraction()', async () => {
      // Given
      const res = {};
      // When
      const result = await coreController.getLogin(req, res);
      // Then
      expect(result).toBe(interactionFinishedValue);
    });
  });

  describe('getOidcCallback', () => {
    let res;
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
      oidcClientServiceMock.utils.checkIdpBlacklisted.mockResolvedValueOnce(
        false,
      );
    });

    it('should call token with providerId', async () => {
      // action
      await coreController.getOidcCallback(req, res, {
        providerUid,
      });

      // assert
      expect(oidcClientServiceMock.getTokenFromProvider).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcClientServiceMock.getTokenFromProvider).toHaveBeenCalledWith(
        tokenParamsMock,
        req,
      );
    });

    it('should call userinfo with acesstoken and context', async () => {
      // arrange

      // action
      await coreController.getOidcCallback(req, res, {
        providerUid,
      });

      // assert
      expect(
        oidcClientServiceMock.getUserInfosFromProvider,
      ).toHaveBeenCalledTimes(1);
      expect(
        oidcClientServiceMock.getUserInfosFromProvider,
      ).toHaveBeenCalledWith(userInfoParamsMock, req);
    });

    it('should patch session with identity result and interaction ID', async () => {
      // action
      await coreController.getOidcCallback(req, res, {
        providerUid,
      });

      // assert
      expect(sessionServiceMock.patch).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.patch).toHaveBeenCalledWith(
        interactionIdMock,
        identityExchangeMock,
      );
    });

    it('should redirect user after token and userinfo received and saved', async () => {
      // action
      await coreController.getOidcCallback(req, res, {
        providerUid,
      });

      // assert
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(redirectMock);
    });

    describe('Idp blacklisted scenario for get oidc callback', () => {
      let isBlacklistedMock;
      beforeEach(() => {
        isBlacklistedMock = oidcClientServiceMock.utils.checkIdpBlacklisted;
        isBlacklistedMock.mockReset();
      });

      it('idp is blacklisted', async () => {
        // setup
        const providerUid = 'foo';
        const errorMock = new Error('New Error');
        sessionServiceMock.get.mockReturnValueOnce({ spId: 'spIdValue' });
        isBlacklistedMock.mockRejectedValueOnce(errorMock);

        // action / assert
        await expect(() =>
          coreController.getOidcCallback(req, res, {
            providerUid,
          }),
        ).rejects.toThrow(errorMock);
      });

      it('idp is not blacklisted', async () => {
        // setup
        const providerUid = 'foo';
        sessionServiceMock.get.mockReturnValueOnce({ spId: 'spIdValue' });
        isBlacklistedMock.mockReturnValueOnce(false);

        // action
        await coreController.getOidcCallback(req, res, { providerUid });

        // assert
        expect(res.redirect).toHaveBeenCalledTimes(1);
      });
    });
  });
});
