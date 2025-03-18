import { Request, Response } from 'express';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { CoreRoutes, CoreVerifyService } from '@fc/core';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { NotificationsService } from '@fc/notifications';
import { IOidcIdentity, OidcSession } from '@fc/oidc';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcClientSession } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { ISessionService, SessionService } from '@fc/session';
import { TrackedEventInterface, TrackingService } from '@fc/tracking';

import { getSessionServiceMock } from '@mocks/session';

import { CoreFcaFqdnService, CoreFcaVerifyService } from '../services';
import { CoreFcaController } from './core-fca.controller';

describe('CoreFcaController', () => {
  let coreController: CoreFcaController;

  const params = { uid: 'abcdefghijklmnopqrstuvwxyz0123456789' };
  const interactionIdMock = 'interactionIdMockValue';
  const acrMock = 'acrMockValue';
  const spIdMock = 'spIdMockValue';
  const spNameMock = 'some SP';
  const idpStateMock = 'idpStateMockValue';
  const idpNonceMock = 'idpNonceMock';
  const idpIdMock = 'idpIdMockValue';
  const idpAcrMock = 'idpAcrMockValue';

  const res = {
    json: jest.fn(),
    status: jest.fn(),
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response;

  const req = {
    fc: {
      interactionId: interactionIdMock,
    },
    query: {
      firstQueryParam: 'first',
      secondQueryParam: 'second',
    },
    route: {
      path: '/some/path',
    },
  } as unknown as Request;

  const interactionDetailsResolved = {
    params: {
      scope: 'toto titi',
    },
    prompt: Symbol('prompt'),
    uid: Symbol('uid'),
  };

  const interactionFinishedValue = Symbol('interactionFinishedValue');
  const providerMock = {
    interactionDetails: jest.fn(),
    interactionFinished: jest.fn(),
  };

  const oidcProviderServiceMock = {
    finishInteraction: jest.fn(),
    getInteraction: jest.fn(),
  };

  const coreVerifyServiceMock = {
    verify: jest.fn(),
    handleUnavailableIdp: jest.fn(),
  };

  const coreFcaFqdnServiceMock: Record<
    keyof InstanceType<typeof CoreFcaFqdnService>,
    jest.Mock
  > = {
    getFqdnConfigFromEmail: jest.fn(),
    getFqdnFromEmail: jest.fn(),
    getSpAuthorizedFqdnsConfig: jest.fn(),
    isAllowedIdpForEmail: jest.fn(),
  };
  const coreFcaVerifyServiceMock = {
    handleVerifyIdentity: jest.fn(),
    handleSsoDisabled: jest.fn(),
    handleErrorLoginRequired: jest.fn(),
  };

  const identityProviderServiceMock = {
    getList: jest.fn(),
    isActiveById: jest.fn(),
  };

  const sessionServiceMock = getSessionServiceMock();

  const sessionCsrfServiceMock = {
    get: jest.fn(),
    save: jest.fn(),
    validate: jest.fn(),
  };

  const randomStringMock = 'randomStringMockValue';

  const cryptographyServiceMock = {
    genRandomString: jest.fn(),
  };

  const appConfigMock = {
    configuration: { acrValues: ['eidas1'] },
    urlPrefix: '/api/v2',
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const trackingServiceMock: TrackingService = {
    track: jest.fn(),
    TrackedEventsMap: {
      FC_SHOWED_IDP_CHOICE: Symbol(
        'FC_SHOWED_IDP_CHOICE',
      ) as unknown as TrackedEventInterface,
    },
  } as unknown as TrackingService;

  const csrfToken = randomStringMock;

  const oidcClientSessionDataMock: OidcClientSession = {
    spId: spIdMock,
    idpId: idpIdMock,
    idpNonce: idpNonceMock,
    idpState: idpStateMock,
    interactionId: interactionIdMock,
    spAcr: acrMock,
    spIdentity: {} as IOidcIdentity,
    spName: spNameMock,
    stepRoute: '/some/route',
  };

  const interactionDetailsMock = {
    prompt: Symbol('prompt'),
    uid: Symbol('uid'),
  };

  const handleUnavailableIdpResult = 'urlPrefixValue/interaction/interactionId';
  const handleVerifyResult = 'urlPrefixValue/login';
  const handleErrorLoginRequiredResult =
    'spRedirectUri?error=login_required&error_description=End-User+authentication+is+required';

  const appSessionServiceMock = getSessionServiceMock();

  const oidcSessionServiceMock = getSessionServiceMock();

  const csrfMock = 'csrfMockValue';

  const oidcSessionMock: OidcSession = {
    idpId: idpIdMock,
    idpNonce: idpNonceMock,
    idpState: idpStateMock,
    interactionId: interactionIdMock,

    idpAcr: idpAcrMock,
    spAcr: acrMock,
    spId: spIdMock,
    spIdentity: {} as IOidcIdentity,
    spName: spNameMock,
    stepRoute: '/some/route',
  };

  const notificationsServiceMock = {
    refreshCache: jest.fn(),
    getList: jest.fn(),
    getNotificationToDisplay: jest.fn(),
  };

  const notificationsMock = Symbol('notifications');

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoreFcaController],
      providers: [
        OidcProviderService,
        IdentityProviderAdapterMongoService,
        ConfigService,
        CoreFcaFqdnService,
        CoreFcaVerifyService,
        CoreVerifyService,
        TrackingService,
        OidcAcrService,
        SessionService,
        NotificationsService,
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderServiceMock)
      .overrideProvider(CoreFcaFqdnService)
      .useValue(coreFcaFqdnServiceMock)
      .overrideProvider(CoreFcaVerifyService)
      .useValue(coreFcaVerifyServiceMock)
      .overrideProvider(CoreVerifyService)
      .useValue(coreVerifyServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingServiceMock)
      .overrideProvider(SessionService)
      .useValue(oidcSessionServiceMock)
      .overrideProvider(NotificationsService)
      .useValue(notificationsServiceMock)
      .compile();

    coreController = app.get<CoreFcaController>(CoreFcaController);

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
    coreVerifyServiceMock.verify.mockResolvedValue(interactionDetailsResolved);

    sessionServiceMock.get.mockReturnValue(oidcClientSessionDataMock);

    sessionServiceMock.set.mockResolvedValueOnce(undefined);
    cryptographyServiceMock.genRandomString.mockReturnValue(randomStringMock);
    configServiceMock.get.mockReturnValue(appConfigMock);

    sessionCsrfServiceMock.get.mockReturnValueOnce(randomStringMock);
    sessionCsrfServiceMock.save.mockResolvedValueOnce(true);

    oidcSessionServiceMock.get.mockReturnValue(oidcSessionMock);
    sessionCsrfServiceMock.get.mockReturnValueOnce(csrfMock);

    identityProviderServiceMock.isActiveById.mockResolvedValue(true);
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
    beforeEach(() => {
      oidcProviderServiceMock.getInteraction.mockResolvedValue(
        interactionDetailsMock,
      );

      oidcProviderServiceMock.getInteraction.mockResolvedValue({
        params: {
          login_hint: 'test@example.com',
        },
      });

      notificationsServiceMock.getNotificationToDisplay.mockResolvedValue(
        notificationsMock,
      );

      appSessionServiceMock.get.mockResolvedValue(false);
    });

    it('should track route if not a refresh', async () => {
      // When
      await coreController.getInteraction(
        req,
        res,
        params,
        csrfToken,
        oidcSessionServiceMock,
      );
      // Then
      expect(trackingServiceMock.track).toHaveBeenCalledTimes(1);
      expect(trackingServiceMock.track).toHaveBeenCalledWith(
        trackingServiceMock.TrackedEventsMap.FC_SHOWED_IDP_CHOICE,
        { req },
      );
    });

    it('should not track route if is a refresh', async () => {
      // Given
      oidcSessionServiceMock.get.mockReturnValueOnce({
        stepRoute: CoreRoutes.INTERACTION,
      });
      // When
      await coreController.getInteraction(
        req,
        res,
        params,
        csrfToken,
        oidcSessionServiceMock,
      );
      // Then
      expect(trackingServiceMock.track).not.toHaveBeenCalled();
    });

    it('should retrieve the spName and stepRoute from oidcSession', async () => {
      // When
      await coreController.getInteraction(
        req,
        res,
        params,
        csrfToken,
        oidcSessionServiceMock,
      );
      // Then
      expect(oidcSessionServiceMock.get).toHaveBeenCalledTimes(1);
      expect(oidcSessionServiceMock.get).toHaveBeenCalledWith();
    });

    it('should retrieve the OidcProvider config', async () => {
      // When
      await coreController.getInteraction(
        req,
        res,
        params,
        csrfToken,
        oidcSessionServiceMock,
      );
      // Then
      expect(configServiceMock.get).toHaveBeenNthCalledWith(1, 'App');
    });

    it('should call the notifications list without params', async () => {
      // When
      await coreController.getInteraction(
        req,
        res,
        params,
        csrfToken,
        oidcSessionServiceMock,
      );

      // Then
      expect(
        notificationsServiceMock.getNotificationToDisplay,
      ).toHaveBeenCalledTimes(1);
      expect(
        notificationsServiceMock.getNotificationToDisplay,
      ).toHaveBeenCalledWith();
    });

    it('should return a complete response when rendering', async () => {
      const expectedInteractionDetails = {
        csrfToken: randomStringMock,
        defaultEmailRenater: undefined,
        loginHint: 'test@example.com',
        notification: notificationsMock,
        spName: oidcSessionMock.spName,
      };

      // When
      await coreController.getInteraction(
        req,
        res,
        params,
        csrfToken,
        oidcSessionServiceMock,
      );

      // Then
      expect(res.render).toHaveBeenCalledTimes(1);
      expect(res.render).toHaveBeenCalledWith(
        'interaction',
        expectedInteractionDetails,
      );
    });
  });

  describe('getVerify()', () => {
    describe('when `identityProvider.isActiveById` returns true', () => {
      it('should call handleVerifyIdentity when idp is active', async () => {
        // Given
        identityProviderServiceMock.isActiveById.mockResolvedValue(true);

        // When
        await coreController.getVerify(
          req,
          res as unknown as Response,
          params,
          sessionServiceMock,
        );

        // Then
        expect(
          coreFcaVerifyServiceMock.handleVerifyIdentity,
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('when `identityProvider.isActiveById` returns false and isSilentAuthentication is false', () => {
      beforeEach(() => {
        identityProviderServiceMock.isActiveById.mockResolvedValue(false);
        coreVerifyServiceMock.handleUnavailableIdp.mockResolvedValue(
          handleUnavailableIdpResult,
        );
        coreFcaVerifyServiceMock.handleVerifyIdentity.mockResolvedValue(
          handleVerifyResult,
        );

        const oidcClientSessionDataMock = {
          isSilentAuthentication: false,
        } as unknown as ISessionService<OidcClientSession>;

        sessionServiceMock.get.mockReturnValue(oidcClientSessionDataMock);
      });

      it('should call `handleUnavailableIdp()` and not `handleVerify()`', async () => {
        // When
        await coreController.getVerify(
          req,
          res as unknown as Response,
          params,
          sessionServiceMock,
        );
        // Then
        expect(
          coreVerifyServiceMock.handleUnavailableIdp,
        ).toHaveBeenCalledTimes(1);
        expect(
          coreFcaVerifyServiceMock.handleVerifyIdentity,
        ).not.toHaveBeenCalled();
      });

      it('should return result from `handleUnavailableIdp()`', async () => {
        // When
        await coreController.getVerify(
          req,
          res as unknown as Response,
          params,
          sessionServiceMock,
        );
        // Then
        expect(res.redirect).toBeCalledTimes(1);
        expect(res.redirect).toBeCalledWith(handleUnavailableIdpResult);
      });
    });

    describe('when `identityProvider.isActiveById` returns false and `isSilentAuthentication` is true', () => {
      beforeEach(() => {
        identityProviderServiceMock.isActiveById.mockResolvedValue(false);
        coreFcaVerifyServiceMock.handleErrorLoginRequired.mockReturnValue(
          handleErrorLoginRequiredResult,
        );
        const oidcClientSessionDataMock = {
          isSilentAuthentication: true,
        } as unknown as ISessionService<OidcClientSession>;

        sessionServiceMock.get.mockReturnValue(oidcClientSessionDataMock);
      });

      it('should call `handleErrorLoginRequired()` and not `handleUnavailableIdp()`', async () => {
        // When
        await coreController.getVerify(
          req,
          res as unknown as Response,
          params,
          sessionServiceMock,
        );
        // Then
        expect(
          coreFcaVerifyServiceMock.handleErrorLoginRequired,
        ).toHaveBeenCalledTimes(1);
        expect(
          coreVerifyServiceMock.handleUnavailableIdp,
        ).not.toHaveBeenCalled();
      });

      it('should return result from `handleErrorLoginRequired()`', async () => {
        // When
        await coreController.getVerify(
          req,
          res as unknown as Response,
          params,
          sessionServiceMock,
        );
        // Then
        expect(res.redirect).toBeCalledTimes(1);
        expect(res.redirect).toBeCalledWith(handleErrorLoginRequiredResult);
      });
    });
  });
});
