import { Request, Response } from 'express';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { AppConfig, UserSession } from '@fc/core/dto';
import { CoreFcaService } from '@fc/core/services/core-fca.service';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcClientConfig, OidcClientService } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

import { getConfigMock } from '@mocks/config';
import { getSessionServiceMock } from '@mocks/session';

import {
  CoreFcaAgentIdpDisabledException,
  CoreFcaIdpConfigurationException,
} from '../exceptions';
import { CoreFcaControllerService } from './core-fca-controller.service';

describe('CoreFcaControllerService', () => {
  let service: CoreFcaControllerService;

  const configServiceMock = getConfigMock();
  const sessionServiceMock = getSessionServiceMock();

  const oidcClientMock = {
    utils: {
      buildAuthorizeParameters: jest.fn(),
      getAuthorizeUrl: jest.fn(),
    },
  } as unknown as OidcClientService;

  const oidcProviderServiceMock = {
    getInteraction: jest.fn(),
  } as unknown as OidcProviderService;

  const oidcAcrMock = {
    getFilteredAcrParamsFromInteraction: jest.fn(),
  } as unknown as OidcAcrService;

  const trackingServiceMock = {
    track: jest.fn(),
  } as unknown as TrackingService;

  const coreFcaServiceMock = {
    ensureEmailIsAuthorizedForSp: jest.fn(),
    safelyGetExistingAndEnabledIdp: jest.fn(),
  } as unknown as CoreFcaService;

  const idpIdMock = 'idpIdMockValue';

  const reqMock = {
    redirect: jest.fn(),
    render: jest.fn(),
  } as unknown as Request;
  const resMock = {
    redirect: jest.fn(),
    render: jest.fn(),
  } as unknown as Response;

  const selectedIdpMock = {
    name: 'nameMockValue',
    title: 'titleMockValue',
    active: true,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    (oidcProviderServiceMock.getInteraction as jest.Mock).mockResolvedValue({
      prompt: {},
    });

    (
      oidcClientMock.utils.buildAuthorizeParameters as jest.Mock
    ).mockResolvedValue({
      nonce: 'mockNonce',
      state: 'mockState',
    });

    (oidcClientMock.utils.getAuthorizeUrl as jest.Mock).mockResolvedValue(
      'http://mock-authorize-url',
    );

    (
      coreFcaServiceMock.safelyGetExistingAndEnabledIdp as jest.Mock
    ).mockResolvedValue(selectedIdpMock);

    (configServiceMock.get as jest.Mock).mockImplementation((key) => {
      if (key === 'OidcClient')
        return { scope: 'scopeMockValue' } as OidcClientConfig;
      if (key === 'App')
        return {
          defaultIdpId: 'idpIdMockValue',
          spAuthorizedFqdnsConfigs: [],
        } as unknown as AppConfig;
      return {} as any;
    });

    (sessionServiceMock.get as jest.Mock).mockReturnValue({
      spId: 'mockSpId',
      login_hint: 'user@example.com',
      spName: 'spName',
      rememberMe: false,
    } as unknown as UserSession);

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaControllerService,
        ConfigService,
        OidcClientService,
        OidcProviderService,
        OidcAcrService,
        SessionService,
        TrackingService,
        CoreFcaService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcClientMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(OidcAcrService)
      .useValue(oidcAcrMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingServiceMock)
      .overrideProvider(CoreFcaService)
      .useValue(coreFcaServiceMock)
      .compile();

    service = app.get<CoreFcaControllerService>(CoreFcaControllerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('redirectToIdp', () => {
    it('should redirect to the IdP with correct authorization URL when acrClaims present', async () => {
      // Given
      (
        oidcAcrMock.getFilteredAcrParamsFromInteraction as jest.Mock
      ).mockReturnValueOnce({
        acrClaims: {},
      });

      // When
      await service.redirectToIdp(reqMock, resMock, idpIdMock);

      // Then
      expect(resMock.redirect).toHaveBeenCalledWith(
        'http://mock-authorize-url',
      );
      expect(sessionServiceMock.set).toHaveBeenCalledWith('User', {
        idpId: 'idpIdMockValue',
        idpName: 'nameMockValue',
        idpLabel: 'titleMockValue',
        idpNonce: 'mockNonce',
        idpState: 'mockState',
        idpIdentity: undefined,
        spIdentity: undefined,
      });
    });

    it('should redirect to the IdP with correct authorization URL when acrValues present', async () => {
      // Given
      (
        oidcAcrMock.getFilteredAcrParamsFromInteraction as jest.Mock
      ).mockReturnValueOnce({
        acrValues: 'mockAcrValue',
      });

      // When
      await service.redirectToIdp(reqMock, resMock, idpIdMock);

      // Then
      expect(resMock.redirect).toHaveBeenCalledWith(
        'http://mock-authorize-url',
      );
    });

    it('should redirect to the IdP with default acr_values when no acr and not default idp', async () => {
      // Given
      (configServiceMock.get as jest.Mock).mockImplementation((key) => {
        if (key === 'OidcClient')
          return { scope: 'scopeMockValue' } as OidcClientConfig;
        if (key === 'App')
          return {
            defaultIdpId: 'anotherIdp',
            spAuthorizedFqdnsConfigs: [],
          } as unknown as AppConfig;
        return {} as any;
      });

      (
        oidcAcrMock.getFilteredAcrParamsFromInteraction as jest.Mock
      ).mockReturnValueOnce({});

      // When
      await service.redirectToIdp(reqMock, resMock, idpIdMock);

      // Then
      expect(resMock.redirect).toHaveBeenCalledWith(
        'http://mock-authorize-url',
      );
    });

    it('should throw CoreFcaIdpConfigurationException if IdP is not found', async () => {
      // Given
      (
        coreFcaServiceMock.safelyGetExistingAndEnabledIdp as jest.Mock
      ).mockRejectedValueOnce(new CoreFcaIdpConfigurationException());

      // When / Then
      await expect(
        service.redirectToIdp(reqMock, resMock, 'invalidIdp'),
      ).rejects.toThrow(CoreFcaIdpConfigurationException);
    });

    it('should throw CoreFcaAgentIdpDisabledException when IdP is disabled', async () => {
      // Given
      (
        coreFcaServiceMock.safelyGetExistingAndEnabledIdp as jest.Mock
      ).mockRejectedValueOnce(new CoreFcaAgentIdpDisabledException());

      // When / Then
      await expect(
        service.redirectToIdp(reqMock, resMock, 'disabledIdp'),
      ).rejects.toThrow(CoreFcaAgentIdpDisabledException);
    });

    it('should propagate unexpected errors from safelyGetExistingAndEnabledIdp', async () => {
      // Given
      (
        coreFcaServiceMock.safelyGetExistingAndEnabledIdp as jest.Mock
      ).mockRejectedValueOnce(new Error('random'));

      // When / Then
      await expect(
        service.redirectToIdp(reqMock, resMock, 'any'),
      ).rejects.toThrow(Error);
    });
  });
});
