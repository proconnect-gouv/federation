import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { OidcProviderService } from '@fc/oidc-provider';
import {
  SessionGenericNotFoundException,
  SessionGenericService,
} from '@fc/session-generic';
import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { NotificationsService } from '@fc/notifications';
import {
  CoreMissingIdentityException,
  CoreInvalidCsrfException,
} from '@fc/core';
import { ScopesService } from '@fc/scopes';
import { OidcClientService } from '@fc/oidc-client';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from '../services/core-fcp.service';
import { ProcessCore } from '../enums';
import { CoreFcpInvalidIdentityException } from '../exceptions';
import { OidcSession } from '@fc/oidc';

describe('CoreFcpController', () => {
  let coreController: CoreFcpController;

  const params = { uid: 'abcdefghijklmnopqrstuvwxyz0123456789' };
  const interactionIdMock = 'interactionIdMockValue';
  const acrMock = 'acrMockValue';
  const spNameMock = 'some SP';
  const spTitleMock = 'title SP';
  const spIdMock = 'spIdMockValue';
  const idpStateMock = 'idpStateMockValue';
  const idpNonceMock = 'idpNonceMock';
  const idpIdMock = 'idpIdMockValue';
  const providerUid = 'providerUidMock';

  const identityMock = {
    sub: '1',
    // oidc spec defined property
    // eslint-disable-next-line @typescript-eslint/naming-convention
    given_name: 'given_name',
  };

  let res;
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
    sendAuthenticationMail: jest.fn(),
    verify: jest.fn(),
    getFeature: jest.fn(),
  };

  const identityProviderServiceMock = {
    getList: jest.fn(),
    getFilteredList: jest.fn(),
  };

  const serviceProviderServiceMock = {
    getById: jest.fn(),
    consentRequired: jest.fn(),
  };

  const sessionServiceMock = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const randomStringMock = 'randomStringMockValue';
  const cryptographyServiceMock = {
    genRandomString: jest.fn(),
  };

  const notificationsServiceMock = {
    getNotifications: jest.fn(),
  };

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };
  const configServiceMock = {
    get: jest.fn(),
  };

  const scopesServiceMock = {
    mapScopesToLabel: jest.fn(),
  };

  const mapScopesToLabelMock = { foo: 'bar' };

  const oidcClientServiceMock = {
    utils: {
      checkIdpBlacklisted: jest.fn(),
    },
    getTokenFromProvider: jest.fn(),
    getUserInfosFromProvider: jest.fn(),
  };

  const serviceProviderMock = {
    name: spNameMock,
    title: spTitleMock,
    type: 'public',
    identityConsent: false,
  };

  const csrfMock = 'myGreatCSRF';

  const sessionDataMock: OidcSession = {
    interactionId: interactionIdMock,
    csrfToken: randomStringMock,

    spAcr: acrMock,
    spId: spIdMock,
    spIdentity: {},
    spName: spNameMock,

    idpId: idpIdMock,
    idpState: idpStateMock,
    idpNonce: idpNonceMock,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoreFcpController],
      providers: [
        LoggerService,
        OidcProviderService,
        CoreFcpService,
        IdentityProviderAdapterMongoService,
        ServiceProviderAdapterMongoService,
        SessionGenericService,
        ConfigService,
        CryptographyService,
        ScopesService,
        NotificationsService,
        OidcClientService,
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(CoreFcpService)
      .useValue(coreServiceMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderServiceMock)
      .overrideProvider(ServiceProviderAdapterMongoService)
      .useValue(serviceProviderServiceMock)
      .overrideProvider(SessionGenericService)
      .useValue(sessionServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyServiceMock)
      .overrideProvider(ScopesService)
      .useValue(scopesServiceMock)
      .overrideProvider(NotificationsService)
      .useValue(notificationsServiceMock)
      .overrideProvider(ScopesService)
      .useValue(scopesServiceMock)
      .overrideProvider(NotificationsService)
      .useValue(notificationsServiceMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .compile();

    coreController = await app.get<CoreFcpController>(CoreFcpController);

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
    serviceProviderServiceMock.getById.mockResolvedValue(serviceProviderMock);
    sessionServiceMock.get.mockResolvedValueOnce(sessionDataMock);
    sessionServiceMock.set.mockResolvedValueOnce(undefined);
    cryptographyServiceMock.genRandomString.mockReturnValue(randomStringMock);
    configServiceMock.get.mockReturnValue(appConfigMock);
    scopesServiceMock.mapScopesToLabel.mockResolvedValue(mapScopesToLabelMock);
  });

  describe('getDefault()', () => {
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

  describe('getInteraction()', () => {
    /*
     * @Todo #486 rework test missing assertion or not complete ones
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/486
     */
    it('should return uid', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      oidcProviderServiceMock.getInteraction.mockResolvedValue({
        uid: 'uid',
        prompt: 'prompt',
        params: 'params',
      });
      // When
      const result = await coreController.getInteraction(
        req,
        res,
        params,
        sessionServiceMock,
      );
      // Then
      expect(result).toHaveProperty('uid');
    });

    it('should throw if session is not found', async () => {
      // Given
      sessionServiceMock.get.mockReset().mockResolvedValueOnce(undefined);
      // When
      await expect(
        coreController.getInteraction(req, res, params, sessionServiceMock),
      ).rejects.toThrow(SessionGenericNotFoundException);
      // Then
    });
  });

  describe('getVerify()', () => {
    it('should call coreService', async () => {
      const res = {
        redirect: jest.fn(),
      };
      // When
      await coreController.getVerify(req, res, params, sessionServiceMock);
      // Then
      expect(coreServiceMock.verify).toHaveBeenCalledTimes(1);
    });

    it('should redirect to /consent URL', async () => {
      const res = {
        redirect: jest.fn(),
      };
      // When
      await coreController.getVerify(req, res, params, sessionServiceMock);
      // Then
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `/api/v2/interaction/${interactionIdMock}/consent`,
      );
    });
  });

  describe('getConsent()', () => {
    beforeEach(() => {
      coreController['generateAndStoreCsrf'] = jest
        .fn()
        .mockResolvedValueOnce(csrfMock);
    });

    it('should get data from session', async () => {
      // Given
      const reqMock = {};
      const resMock = {};
      // When
      await coreController.getConsent(
        reqMock,
        resMock,
        params,
        sessionServiceMock,
      );
      // Then
      expect(sessionServiceMock.get).toHaveBeenCalledTimes(1);
    });

    it('should get the service provider by id', async () => {
      // Given
      const reqMock = {
        fc: { interactionId: interactionIdMock },
      };
      const resMock = {};
      // When
      await coreController.getConsent(
        reqMock,
        resMock,
        params,
        sessionServiceMock,
      );
      // Then
      expect(serviceProviderServiceMock.getById).toHaveBeenCalledTimes(1);
      expect(serviceProviderServiceMock.getById).toHaveBeenCalledWith(spIdMock);
    });

    it('should check if consent is required', async () => {
      // Given
      const reqMock = {
        fc: { interactionId: interactionIdMock },
      };
      const resMock = {};
      // When
      await coreController.getConsent(
        reqMock,
        resMock,
        params,
        sessionServiceMock,
      );
      // Then
      expect(serviceProviderServiceMock.consentRequired).toHaveBeenCalledTimes(
        1,
      );
      expect(serviceProviderServiceMock.consentRequired).toHaveBeenCalledWith(
        serviceProviderMock.type,
        serviceProviderMock.identityConsent,
      );
    });

    it('should get data from interaction with oidc provider', async () => {
      // Given
      const reqMock = {
        fc: { interactionId: interactionIdMock },
      };
      const resMock = {};

      // When
      await coreController.getConsent(
        reqMock,
        resMock,
        params,
        sessionServiceMock,
      );
      // Then
      expect(oidcProviderServiceMock.getInteraction).toHaveBeenCalledTimes(1);
      expect(oidcProviderServiceMock.getInteraction).toHaveBeenCalledWith(
        reqMock,
        resMock,
      );
    });

    it('should generate a csrf token', async () => {
      // Given
      const reqMock = {
        fc: { interactionId: interactionIdMock },
      };
      const resMock = {};

      // When
      await coreController.getConsent(
        reqMock,
        resMock,
        params,
        sessionServiceMock,
      );
      // Then
      expect(coreController['generateAndStoreCsrf']).toHaveBeenCalledTimes(1);
      expect(coreController['generateAndStoreCsrf']).toHaveBeenCalledWith(
        sessionServiceMock,
      );
    });

    it('should filter scopes labels to keep', async () => {
      // Given
      const reqMock = {
        fc: { interactionId: interactionIdMock },
      };
      const resMock = {};

      // When
      await coreController.getConsent(
        reqMock,
        resMock,
        params,
        sessionServiceMock,
      );
      // Then
      expect(scopesServiceMock.mapScopesToLabel).toHaveBeenCalledTimes(1);
      expect(scopesServiceMock.mapScopesToLabel).toHaveBeenCalledWith(
        interactionDetailsResolved.params.scope.split(' '),
      );
    });

    it('should return data from session for interactionId', async () => {
      // Given
      const reqMock = {
        fc: { interactionId: interactionIdMock },
      };
      const resMock = {};
      serviceProviderServiceMock.consentRequired.mockReturnValue(false);

      // When
      const result = await coreController.getConsent(
        reqMock,
        resMock,
        params,
        sessionServiceMock,
      );
      // Then
      expect(result).toStrictEqual({
        csrfToken: csrfMock,
        interactionId: interactionIdMock,
        identity: {},
        scopes: ['toto', 'titi'],
        claims: { foo: 'bar' },
        spName: spNameMock,
        consentRequired: false,
      });
    });
  });

  describe('getLogin()', () => {
    it('should throw an exception if no session', async () => {
      // Given
      const body = { _csrf: randomStringMock };
      const next = jest.fn();
      sessionServiceMock.get.mockReset().mockResolvedValue(undefined);
      // Then
      await expect(
        coreController.getLogin(next, body, sessionServiceMock),
      ).rejects.toThrow(SessionGenericNotFoundException);
    });

    it('should throw an exception if no identity in session', async () => {
      // Given
      const body = { _csrf: randomStringMock };
      const next = jest.fn();
      sessionServiceMock.get.mockReset().mockResolvedValue({
        interactionId: interactionIdMock,
        spAcr: acrMock,
        spName: spNameMock,
        csrfToken: randomStringMock,
      });
      // Then
      await expect(
        coreController.getLogin(next, body, sessionServiceMock),
      ).rejects.toThrow(CoreMissingIdentityException);
    });

    it('should throw an exception if csrf not match with csrfToken in session', async () => {
      // Given
      const body = { _csrf: 'csrfNotMatchingCsrfTokenInSession' };
      const next = jest.fn();
      // Then
      await expect(
        coreController.getLogin(next, body, sessionServiceMock),
      ).rejects.toThrow(CoreInvalidCsrfException);
    });

    it('should send an email notification to the end user by calling core.sendAuthenticationMail', async () => {
      // Given
      const body = { _csrf: randomStringMock };
      const next = jest.fn();
      // When
      await coreController.getLogin(next, body, sessionServiceMock);
      // Then
      expect(coreServiceMock.sendAuthenticationMail).toBeCalledTimes(1);
      expect(coreServiceMock.sendAuthenticationMail).toBeCalledWith(
        sessionDataMock,
      );
    });

    it('should call next', async () => {
      // Given
      const body = { _csrf: randomStringMock };
      const next = jest.fn();
      // When
      await coreController.getLogin(next, body, sessionServiceMock);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOidcCallback()', () => {
    const accessTokenMock = Symbol('accesToken');
    const amrMock = Symbol('amr');

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
      amr: amrMock,
      idpIdentity: identityMock,
      idpAcr: acrMock,
      idpAccessToken: accessTokenMock,
    };
    const redirectMock = `/api/v2/interaction/${interactionIdMock}/verify`;

    let validateIdentityMock;
    beforeEach(() => {
      res = {
        redirect: jest.fn(),
      };

      oidcClientServiceMock.getTokenFromProvider.mockReturnValueOnce({
        accessToken: accessTokenMock,
        acr: acrMock,
        amr: amrMock,
      });
      oidcClientServiceMock.getUserInfosFromProvider.mockReturnValueOnce(
        identityMock,
      );

      validateIdentityMock = jest.spyOn<CoreFcpController, any>(
        coreController,
        'validateIdentity',
      );
      validateIdentityMock.mockResolvedValueOnce();
      oidcClientServiceMock.utils.checkIdpBlacklisted.mockResolvedValueOnce(
        false,
      );
    });

    it('should call token with providerId', async () => {
      // action
      await coreController.getOidcCallback(
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
      // action
      await coreController.getOidcCallback(
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

    it('should failed to get identity if validation failed', async () => {
      // arrange
      const errorMock = new Error('Unknown Error');
      validateIdentityMock.mockReset().mockRejectedValueOnce(errorMock);

      // action
      await expect(
        coreController.getOidcCallback(
          req,
          res,
          { providerUid },
          sessionServiceMock,
        ),
      ).rejects.toThrow(errorMock);

      // assert
      expect(validateIdentityMock).toHaveBeenCalledTimes(1);
      expect(validateIdentityMock).toHaveBeenCalledWith(
        idpIdMock,
        providerUid,
        identityMock,
      );
    });

    it('should set session with identity result and interaction ID', async () => {
      // action
      await coreController.getOidcCallback(
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
      await coreController.getOidcCallback(
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
          coreController.getOidcCallback(
            req,
            res,
            {
              providerUid,
            },
            sessionServiceMock,
          ),
        ).rejects.toThrow(errorMock);
      });

      it('idp is not blacklisted', async () => {
        // setup
        const providerUid = 'foo';
        sessionServiceMock.get.mockReturnValueOnce({ spId: 'spIdValue' });
        isBlacklistedMock.mockReturnValueOnce(false);

        // action
        await coreController.getOidcCallback(
          req,
          res,
          { providerUid },
          sessionServiceMock,
        );

        // assert
        expect(res.redirect).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('generateAndStoreCsrf()', () => {
    it('should return the csrfToken', async () => {
      // Given
      // When
      const result = await coreController['generateAndStoreCsrf'](
        sessionServiceMock,
      );
      // Then
      expect(result).toBe('randomStringMockValue');
    });

    it('should set the sessions', async () => {
      // Given
      // When
      await coreController['generateAndStoreCsrf'](sessionServiceMock);
      // Then
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith({
        csrfToken: 'randomStringMockValue',
      });
    });
  });

  describe('validateIdentity()', () => {
    let handleFnMock;
    let handlerMock;

    beforeEach(() => {
      handleFnMock = jest.fn();
      handlerMock = {
        handle: handleFnMock,
      };
      coreServiceMock.getFeature.mockResolvedValueOnce(handlerMock);
    });

    it('should succeed to get the right handler to validate identity', async () => {
      // arrange
      handleFnMock.mockResolvedValueOnce([]);
      // action
      await coreController['validateIdentity'](
        idpIdMock,
        providerUid,
        identityMock,
      );
      // expect
      expect(coreServiceMock.getFeature).toHaveBeenCalledTimes(1);
      expect(coreServiceMock.getFeature).toHaveBeenCalledWith(
        idpIdMock,
        ProcessCore.ID_CHECK,
      );
    });

    it('should succeed validate identity from feature handler', async () => {
      // arrange
      handleFnMock.mockResolvedValueOnce([]);
      // action
      await coreController['validateIdentity'](
        idpIdMock,
        providerUid,
        identityMock,
      );
      // expect
      expect(handleFnMock).toHaveBeenCalledTimes(1);
      expect(handleFnMock).toHaveBeenCalledWith(identityMock);
    });

    it('should failed to validate identity', async () => {
      // arrange
      handleFnMock.mockResolvedValueOnce(['Unknown Error']);

      await expect(
        // action
        coreController['validateIdentity'](
          idpIdMock,
          providerUid,
          identityMock,
        ),
        // expect
      ).rejects.toThrow(CoreFcpInvalidIdentityException);
    });
  });
});
