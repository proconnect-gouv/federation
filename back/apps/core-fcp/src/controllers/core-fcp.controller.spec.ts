import { CryptographyService } from '@fc/cryptography';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { CoreMissingIdentityException } from '@fc/core';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { NotificationsService } from '@fc/notifications';
import { OidcSession } from '@fc/oidc';
import { OidcClientService } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import {
  SessionCsrfService,
  SessionInvalidCsrfConsentException,
  SessionNotFoundException,
  SessionService,
} from '@fc/session';
import { TrackingService } from '@fc/tracking';

import { ProcessCore } from '../enums';
import {
  CoreFcpDatatransferConsentIdentityEvent,
  CoreFcpDatatransferInformationAnonymousEvent,
  CoreFcpDatatransferInformationIdentityEvent,
} from '../events';
import {
  CoreFcpInvalidEventClassException,
  CoreFcpInvalidIdentityException,
} from '../exceptions';
import { CoreFcpService } from '../services/core-fcp.service';
import { CoreFcpController } from './core-fcp.controller';

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

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  } as unknown as LoggerService;

  const coreServiceMock = {
    sendAuthenticationMail: jest.fn(),
    verify: jest.fn(),
    getFeature: jest.fn(),
    getScopesForInteraction: jest.fn(),
    getClaimsForInteraction: jest.fn(),
    getClaimsLabelsForInteraction: jest.fn(),
    isConsentRequired: jest.fn(),
    rejectInvalidAcr: jest.fn(),
  };

  const scopesMock = ['toto', 'titi'];
  const claimsMock = ['foo', 'bar'];
  const claimsLabelMock = ['F o o', 'B a r'];

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
    setAlias: jest.fn(),
  };

  const sessionCsrfServiceMock = {
    get: jest.fn(),
    save: jest.fn(),
    validate: jest.fn(),
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
    configuration: { acrValues: ['eidas2', 'eidas3'] },
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

  const serviceProviderMock = {
    name: spNameMock,
    title: spTitleMock,
    type: 'public',
    identityConsent: false,
  };

  const trackingServiceMock = {
    track: jest.fn(),
  };

  const csrfMock = 'csrfMockValue';

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
        SessionService,
        ConfigService,
        CryptographyService,
        NotificationsService,
        OidcClientService,
        TrackingService,
        SessionCsrfService,
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
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyServiceMock)
      .overrideProvider(NotificationsService)
      .useValue(notificationsServiceMock)
      .overrideProvider(NotificationsService)
      .useValue(notificationsServiceMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingServiceMock)
      .overrideProvider(SessionCsrfService)
      .useValue(sessionCsrfServiceMock)
      .compile();

    coreController = await app.get<CoreFcpController>(CoreFcpController);

    configServiceMock.get.mockReturnValue(appConfigMock);

    providerMock.interactionDetails.mockResolvedValue(
      interactionDetailsResolved,
    );
    oidcProviderServiceMock.finishInteraction.mockReturnValue(
      interactionFinishedValue,
    );
    oidcProviderServiceMock.getInteraction.mockResolvedValue(
      interactionDetailsResolved,
    );
    serviceProviderServiceMock.getById.mockResolvedValue(serviceProviderMock);

    sessionServiceMock.get.mockResolvedValueOnce(sessionDataMock);
    sessionServiceMock.set.mockResolvedValueOnce(undefined);

    cryptographyServiceMock.genRandomString.mockReturnValue(randomStringMock);

    coreServiceMock.verify.mockResolvedValue(interactionDetailsResolved);
    coreServiceMock.rejectInvalidAcr.mockResolvedValue(false);
    coreServiceMock.getClaimsForInteraction.mockResolvedValue(claimsMock);
    coreServiceMock.getScopesForInteraction.mockResolvedValue(scopesMock);
    coreServiceMock.isConsentRequired.mockResolvedValue(true);
    coreServiceMock.getClaimsLabelsForInteraction.mockResolvedValue(
      claimsLabelMock,
    );

    sessionCsrfServiceMock.get.mockReturnValueOnce(csrfMock);
    sessionCsrfServiceMock.save.mockResolvedValueOnce(true);
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
    it('should return nothing, stop interaction, when acr values are not matching', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {
        render: jest.fn(),
      };
      oidcProviderServiceMock.getInteraction.mockResolvedValue({
        uid: 'uid',
        prompt: 'prompt',
        params: 'params',
      });
      coreServiceMock.rejectInvalidAcr.mockResolvedValue(true);
      // When
      const result = await coreController.getInteraction(
        req,
        res,
        params,
        sessionServiceMock,
      );
      // Then
      expect(result).toBeUndefined();
    });

    /*
     * @Todo #486 rework test missing assertion or not complete ones
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/486
     */
    it('should call res.render() with the interaction templates and its values', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {
        render: jest.fn(),
      };
      oidcProviderServiceMock.getInteraction.mockResolvedValue({
        uid: 'uid',
        prompt: 'prompt',
        params: 'params',
      });
      // When
      await coreController.getInteraction(req, res, params, sessionServiceMock);
      // Then
      expect(res.render).toHaveBeenCalledTimes(1);
      expect(res.render).toHaveBeenCalledWith('interaction', {
        notifications: undefined,
        params: 'params',
        providers: undefined,
        scope: undefined,
        spName: 'some SP',
        uid: 'uid',
        csrfToken: csrfMock,
      });
    });

    it('should throw if session is not found', async () => {
      // Given
      sessionServiceMock.get.mockReset().mockResolvedValueOnce(undefined);
      // When
      await expect(
        coreController.getInteraction(req, res, params, sessionServiceMock),
      ).rejects.toThrow(SessionNotFoundException);
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

  describe('getEventClass()', () => {
    // Given
    const scopesMock = ['openid', 'profile'];
    const consentRequiredMock = false;

    it('should return consent for identity', () => {
      // Given

      const consentRequiredMock = true;
      // When
      const result = coreController['getEventClass'](
        scopesMock,
        consentRequiredMock,
      );
      // Then
      expect(result).toBe(CoreFcpDatatransferConsentIdentityEvent);
    });

    it('should return information for identity', () => {
      // When
      const result = coreController['getEventClass'](
        scopesMock,
        consentRequiredMock,
      );
      // Then
      expect(result).toBe(CoreFcpDatatransferInformationIdentityEvent);
    });

    it('should return information for anonymous', () => {
      // Given
      const scopesMock = ['openid'];
      // When
      const result = coreController['getEventClass'](
        scopesMock,
        consentRequiredMock,
      );
      // Then
      expect(result).toBe(CoreFcpDatatransferInformationAnonymousEvent);
    });

    it('should throw an exception if class is not in map', () => {
      // Given
      const scopesMock = ['openid'];
      const consentRequiredMock = true;
      // Then
      expect(() =>
        coreController['getEventClass'](scopesMock, consentRequiredMock),
      ).toThrow(CoreFcpInvalidEventClassException);
    });
  });

  describe('trackDatatransfer()', () => {
    // Given
    const contextMock = {};
    const interactionMock = {};
    const spIdMock = 'foo';
    const eventClassMock = 'foo';

    beforeEach(() => {
      coreController['getEventClass'] = jest
        .fn()
        .mockReturnValue(eventClassMock);
    });

    it('should get scopes', async () => {
      // When
      await coreController['trackDatatransfer'](
        contextMock,
        interactionMock,
        spIdMock,
      );
      // Then
      expect(coreServiceMock.getScopesForInteraction).toHaveBeenCalledTimes(1);
      expect(coreServiceMock.getScopesForInteraction).toHaveBeenCalledWith(
        interactionMock,
      );
    });

    it('should get claims', async () => {
      // When
      await coreController['trackDatatransfer'](
        contextMock,
        interactionMock,
        spIdMock,
      );
      // Then
      expect(coreServiceMock.getClaimsForInteraction).toHaveBeenCalledTimes(1);
      expect(coreServiceMock.getClaimsForInteraction).toHaveBeenCalledWith(
        interactionMock,
      );
    });

    it('should get consent requirement', async () => {
      // When
      await coreController['trackDatatransfer'](
        contextMock,
        interactionMock,
        spIdMock,
      );
      // Then
      expect(coreServiceMock.isConsentRequired).toHaveBeenCalledTimes(1);
      expect(coreServiceMock.isConsentRequired).toHaveBeenCalledWith(spIdMock);
    });

    it('should get event class', async () => {
      // When
      await coreController['trackDatatransfer'](
        contextMock,
        interactionMock,
        spIdMock,
      );
      // Then
      expect(coreController['getEventClass']).toHaveBeenCalledTimes(1);
      expect(coreController['getEventClass']).toHaveBeenCalledWith(
        scopesMock,
        true,
      );
    });

    it('should call tracking.track', async () => {
      // When
      await coreController['trackDatatransfer'](
        contextMock,
        interactionMock,
        spIdMock,
      );

      const sentContextMock = {
        ...contextMock,
        claims: claimsMock,
      };
      // Then
      expect(trackingServiceMock.track).toHaveBeenCalledTimes(1);
      expect(trackingServiceMock.track).toHaveBeenCalledWith(
        eventClassMock,
        sentContextMock,
      );
    });
  });

  describe('getConsent()', () => {
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
      expect(coreServiceMock.isConsentRequired).toHaveBeenCalledTimes(1);
      expect(coreServiceMock.isConsentRequired).toHaveBeenCalledWith(spIdMock);
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
      expect(sessionCsrfServiceMock.get).toHaveBeenCalledTimes(1);
      expect(sessionCsrfServiceMock.get).toHaveBeenCalledWith();
      expect(sessionCsrfServiceMock.save).toHaveBeenCalledTimes(1);
      expect(sessionCsrfServiceMock.save).toHaveBeenCalledWith(
        sessionServiceMock,
        csrfMock,
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
        scopes: scopesMock,
        claims: claimsLabelMock,
        spName: spNameMock,
        consentRequired: true,
      });
    });
  });

  describe('getLogin()', () => {
    it('should throw an exception if no session', async () => {
      // Given
      const body = { _csrf: randomStringMock };
      sessionServiceMock.get.mockReset().mockResolvedValue(undefined);
      // Then
      await expect(
        coreController.getLogin(req, res, body, sessionServiceMock),
      ).rejects.toThrow(SessionNotFoundException);
    });

    it('should throw an exception if no identity in session', async () => {
      // Given
      const body = { _csrf: randomStringMock };
      sessionServiceMock.get.mockReset().mockResolvedValue({
        interactionId: interactionIdMock,
        spAcr: acrMock,
        spName: spNameMock,
        csrfToken: randomStringMock,
      });
      // Then
      await expect(
        coreController.getLogin(req, res, body, sessionServiceMock),
      ).rejects.toThrow(CoreMissingIdentityException);
    });

    it('should throw an exception `SessionInvalidCsrfConsentException` if the CSRF token is not valid', async () => {
      // Given
      const csrfTokenBodyMock = 'invalidCsrfTokenValue';
      const csrfTokenSessionMock = randomStringMock;
      const body = { _csrf: csrfTokenBodyMock };
      sessionServiceMock.get.mockReset().mockResolvedValue({
        interactionId: interactionIdMock,
        spAcr: acrMock,
        spName: spNameMock,
        csrfToken: csrfTokenSessionMock,
      });
      sessionCsrfServiceMock.validate.mockReset().mockImplementation(() => {
        throw new Error(
          'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
        );
      });
      // Then
      await expect(
        coreController.getLogin(req, res, body, sessionServiceMock),
      ).rejects.toThrow(SessionInvalidCsrfConsentException);
    });

    it('should send an email notification to the end user by calling core.sendAuthenticationMail', async () => {
      // Given
      const body = { _csrf: randomStringMock };
      // When
      await coreController.getLogin(req, res, body, sessionServiceMock);
      // Then
      expect(coreServiceMock.sendAuthenticationMail).toBeCalledTimes(1);
      expect(coreServiceMock.sendAuthenticationMail).toBeCalledWith(
        sessionDataMock,
      );
    });

    it('should call oidcProvider.interactionFinish', async () => {
      // Given
      const body = { _csrf: randomStringMock };
      // When
      await coreController.getLogin(req, res, body, sessionServiceMock);
      // Then
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledWith(
        req,
        res,
        sessionDataMock,
      );
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
