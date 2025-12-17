import { Request, Response } from 'express';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { AppConfig, UserSession } from '@fc/core/dto';
import { Routes } from '@fc/core/enums';
import { CoreFcaService } from '@fc/core/services/core-fca.service';
import { EmailValidatorService } from '@fc/email-validator/services';
import { LoggerService } from '@fc/logger';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcClientConfig, OidcClientService } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import {
  CoreFcaAgentIdpDisabledException,
  CoreFcaAgentNoIdpException,
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

  const loggerServiceMock = getLoggerMock();

  const coreFcaServiceMock = {
    ensureEmailIsAuthorizedForSp: jest.fn(),
    safelyGetExistingAndEnabledIdp: jest.fn(),
    selectIdpsFromEmail: jest.fn(),
  } as unknown as CoreFcaService;

  const idpIdMock = 'idpIdMockValue';
  const emailValidatorServiceMock = {
    validate: jest.fn(),
  } as unknown as EmailValidatorService;

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
    isEntraID: false,
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
          urlPrefix: '/app',
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
        CoreFcaService,
        EmailValidatorService,
        LoggerService,
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
      .overrideProvider(CoreFcaService)
      .useValue(coreFcaServiceMock)
      .overrideProvider(EmailValidatorService)
      .useValue(emailValidatorServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = app.get<CoreFcaControllerService>(CoreFcaControllerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('redirectToIdpWithIdpId', () => {
    it('should redirect to the IdP with correct authorization URL when acrClaims present', async () => {
      // Given
      (
        oidcAcrMock.getFilteredAcrParamsFromInteraction as jest.Mock
      ).mockReturnValueOnce({
        acrClaims: {},
      });

      // When
      await service.redirectToIdpWithIdpId(reqMock, resMock, idpIdMock);

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
      await service.redirectToIdpWithIdpId(reqMock, resMock, idpIdMock);

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
      await service.redirectToIdpWithIdpId(reqMock, resMock, idpIdMock);

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
        service.redirectToIdpWithIdpId(reqMock, resMock, 'invalidIdp'),
      ).rejects.toThrow(CoreFcaIdpConfigurationException);
    });

    it('should throw CoreFcaAgentIdpDisabledException when IdP is disabled', async () => {
      // Given
      (
        coreFcaServiceMock.safelyGetExistingAndEnabledIdp as jest.Mock
      ).mockRejectedValueOnce(new CoreFcaAgentIdpDisabledException());

      // When / Then
      await expect(
        service.redirectToIdpWithIdpId(reqMock, resMock, 'disabledIdp'),
      ).rejects.toThrow(CoreFcaAgentIdpDisabledException);
    });

    it('should propagate unexpected errors from safelyGetExistingAndEnabledIdp', async () => {
      // Given
      (
        coreFcaServiceMock.safelyGetExistingAndEnabledIdp as jest.Mock
      ).mockRejectedValueOnce(new Error('random'));

      // When / Then
      await expect(
        service.redirectToIdpWithIdpId(reqMock, resMock, 'any'),
      ).rejects.toThrow(Error);
    });

    it('should use a smaller set of scopes when IdP is Entra ID', async () => {
      (
        coreFcaServiceMock.safelyGetExistingAndEnabledIdp as jest.Mock
      ).mockReturnValue({ isEntraID: true });
      (
        oidcAcrMock.getFilteredAcrParamsFromInteraction as jest.Mock
      ).mockReturnValueOnce({});

      await service.redirectToIdpWithIdpId(reqMock, resMock, idpIdMock);

      const params = (oidcClientMock.utils.getAuthorizeUrl as jest.Mock).mock
        .calls[0][1];
      expect(params).toMatchObject({ scope: 'openid email profile' });
    });

    it('should not pass any claims to authorize when IdP is Entra ID', async () => {
      (
        coreFcaServiceMock.safelyGetExistingAndEnabledIdp as jest.Mock
      ).mockReturnValue({ isEntraID: true });
      (
        oidcAcrMock.getFilteredAcrParamsFromInteraction as jest.Mock
      ).mockReturnValueOnce({});

      await service.redirectToIdpWithIdpId(reqMock, resMock, idpIdMock);

      const params = (oidcClientMock.utils.getAuthorizeUrl as jest.Mock).mock
        .calls[0][1];
      expect(params.claims).toBeUndefined();
    });
  });

  describe('redirectToIdpWithEmail', () => {
    const email = 'user@example.com';

    it('should validate email, store hint, and throw when no IdP matches', async () => {
      (
        coreFcaServiceMock.selectIdpsFromEmail as jest.Mock
      ).mockResolvedValueOnce([]);
      (emailValidatorServiceMock.validate as jest.Mock).mockResolvedValueOnce({
        isEmailValid: true,
      });

      await expect(
        service.redirectToIdpWithEmail(reqMock, resMock, email, true),
      ).rejects.toThrow(CoreFcaAgentNoIdpException);

      expect(emailValidatorServiceMock.validate).toHaveBeenCalledWith(email);
      expect(sessionServiceMock.set).toHaveBeenCalledWith('User', {
        rememberMe: true,
        idpLoginHint: email,
      });
      expect(resMock.redirect).not.toHaveBeenCalled();
    });

    it('should validate email, store hint, and redirect to selection when multiple IdPs match', async () => {
      (
        coreFcaServiceMock.selectIdpsFromEmail as jest.Mock
      ).mockResolvedValueOnce([{ uid: 'idp1' }, { uid: 'idp2' }]);
      (emailValidatorServiceMock.validate as jest.Mock).mockResolvedValueOnce({
        isEmailValid: true,
      });

      await service.redirectToIdpWithEmail(reqMock, resMock, email, false);

      expect(emailValidatorServiceMock.validate).toHaveBeenCalledWith(email);
      expect(sessionServiceMock.set).toHaveBeenCalledWith('User', {
        rememberMe: false,
        idpLoginHint: email,
      });
      expect(resMock.redirect).toHaveBeenCalledWith(
        '/app' + Routes.IDENTITY_PROVIDER_SELECTION,
      );
    });

    it('should validate email, store hint, and delegate to redirectToIdpWithIdpId when a single IdP matches', async () => {
      (
        coreFcaServiceMock.selectIdpsFromEmail as jest.Mock
      ).mockResolvedValueOnce([{ uid: 'unique-idp' }]);
      (emailValidatorServiceMock.validate as jest.Mock).mockResolvedValueOnce({
        isEmailValid: true,
      });

      const spy = jest
        .spyOn(service, 'redirectToIdpWithIdpId')
        .mockResolvedValueOnce(undefined);

      await service.redirectToIdpWithEmail(reqMock, resMock, email, true);

      expect(emailValidatorServiceMock.validate).toHaveBeenCalledWith(email);
      expect(sessionServiceMock.set).toHaveBeenCalledWith('User', {
        rememberMe: true,
        idpLoginHint: email,
      });
      expect(spy).toHaveBeenCalledWith(reqMock, resMock, 'unique-idp');
      expect(resMock.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to interaction with error when ', async () => {
      (
        coreFcaServiceMock.selectIdpsFromEmail as jest.Mock
      ).mockResolvedValueOnce([{ uid: 'unique-idp' }]);
      (emailValidatorServiceMock.validate as jest.Mock).mockResolvedValueOnce({
        isEmailValid: false,
        suggestion: 'user@valid-example.com',
      });
      (
        oidcProviderServiceMock.getInteraction as jest.Mock
      ).mockResolvedValueOnce({
        uid: 'mock-interaction-id',
      });

      await service.redirectToIdpWithEmail(reqMock, resMock, email, true);

      expect(emailValidatorServiceMock.validate).toHaveBeenCalledWith(email);
      expect(resMock.redirect).toHaveBeenCalledWith(
        `/app/interaction/mock-interaction-id?error=invalid_email&email_suggestion=user%40valid-example.com`,
      );
    });
  });
});
