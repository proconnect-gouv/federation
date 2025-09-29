import { Request, Response } from 'express';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { FqdnToIdpAdapterMongoService } from '@fc/fqdn-to-idp-adapter-mongo';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcClientService } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import {
  CoreFcaAgentIdpDisabledException,
  CoreFcaIdpConfigurationException,
} from '../exceptions';
import { CoreFcaService } from './core-fca.service';
import { CoreFcaFqdnService } from './core-fca-fqdn.service';

describe('CoreFcaService', () => {
  let service: CoreFcaService;

  const configServiceMock = getConfigMock();
  const loggerServiceMock = getLoggerMock();

  const sessionServiceMock = getSessionServiceMock();

  const oidcMock = {
    utils: {
      buildAuthorizeParameters: jest.fn(),
      getAuthorizeUrl: jest.fn(),
    },
  };
  const oidcProviderServiceMock = {
    getInteraction: jest.fn(),
    finishInteraction: jest.fn(),
  };

  const oidcAcrMock = {
    getFilteredAcrParamsFromInteraction: jest.fn(),
  };

  const idpIdMock = 'idpIdMockValue';
  const spIdMock = 'spIdMockValue';
  const reqMock = {
    redirect: jest.fn(),
    render: jest.fn(),
  } as unknown as Request;
  const resMock = {
    redirect: jest.fn(),
    render: jest.fn(),
  } as unknown as Response;

  const identityProviderMock = {
    getById: jest.fn(),
    getList: jest.fn(),
  };

  const identityProviderMockResponse = {
    name: 'nameMockValue',
    title: 'titleMockValue',
    active: true,
  };

  const nonceMock = Symbol('nonceMockValue');
  const stateMock = Symbol('stateMockValue');

  const authorizeUrlMock = Symbol('authorizeUrlMockValue');

  const fqdnToIdpAdapterMongoMock = {
    getIdpsByFqdn: jest.fn(),
    refreshCache: jest.fn(),
    getList: jest.fn(),
  };

  const coreAuthorizationServiceMock = {
    getAuthorizeUrl: jest.fn(),
  };

  const coreFcaFqdnServiceMock = {
    getFqdnConfigFromEmail: jest.fn(),
    getSpAuthorizedFqdnsConfig: jest.fn(),
  };

  const trackingServiceMock = {
    track: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaService,
        OidcProviderService,
        OidcAcrService,
        ConfigService,
        OidcClientService,
        IdentityProviderAdapterMongoService,
        FqdnToIdpAdapterMongoService,
        SessionService,
        CoreFcaFqdnService,
        LoggerService,
        TrackingService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderMock)
      .overrideProvider(FqdnToIdpAdapterMongoService)
      .useValue(fqdnToIdpAdapterMongoMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(CoreFcaFqdnService)
      .useValue(coreFcaFqdnServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(OidcAcrService)
      .useValue(oidcAcrMock)
      .overrideProvider(TrackingService)
      .useValue(trackingServiceMock)
      .compile();

    service = app.get<CoreFcaService>(CoreFcaService);

    oidcProviderServiceMock.getInteraction.mockResolvedValueOnce({
      prompt: {},
    });
    oidcMock.utils.buildAuthorizeParameters.mockResolvedValue({
      nonce: nonceMock,
      state: stateMock,
    });
    oidcMock.utils.getAuthorizeUrl.mockResolvedValue({
      nonce: nonceMock,
      state: stateMock,
    });
    identityProviderMock.getById.mockResolvedValue(
      identityProviderMockResponse,
    );
    coreAuthorizationServiceMock.getAuthorizeUrl.mockResolvedValue(
      authorizeUrlMock,
    );

    coreFcaFqdnServiceMock.getFqdnConfigFromEmail.mockResolvedValue({
      fqdn: '',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('redirectToIdp', () => {
    beforeEach(() => {
      sessionServiceMock.get.mockReturnValue({
        spId: 'mockSpId',
        login_hint: 'user@example.com',
      });
      configServiceMock.get.mockReturnValue({
        scope: 'scopeMockValue',
        defaultIdpId: 'idpIdMockValue',
      });
    });

    it('should redirect to the IdP with correct authorization URL', async () => {
      // Given
      oidcMock.utils.buildAuthorizeParameters.mockResolvedValueOnce({
        nonce: 'mockNonce',
        state: 'mockState',
      });
      oidcMock.utils.getAuthorizeUrl.mockResolvedValueOnce(
        'http://mock-authorize-url',
      );

      oidcAcrMock.getFilteredAcrParamsFromInteraction.mockReturnValueOnce({
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
        inputEmail: 'user@example.com',
        spIdentity: undefined,
      });
    });

    it('should redirect to the IdP with correct authorization URL', async () => {
      // Given
      oidcAcrMock.getFilteredAcrParamsFromInteraction.mockReturnValueOnce({
        acrValues: 'mockAcrValue',
      });
      oidcMock.utils.getAuthorizeUrl.mockResolvedValueOnce(
        'http://mock-authorize-url',
      );

      // When
      await service.redirectToIdp(reqMock, resMock, idpIdMock);

      // Then
      expect(resMock.redirect).toHaveBeenCalledWith(
        'http://mock-authorize-url',
      );
    });

    it('should redirect to the IdP with correct authorization URL', async () => {
      // Given
      oidcMock.utils.getAuthorizeUrl.mockResolvedValueOnce(
        'http://mock-authorize-url',
      );
      configServiceMock.get.mockReturnValue({
        scope: 'scopeMockValue',
        defaultIdpId: 'anotherIdp',
      });
      oidcAcrMock.getFilteredAcrParamsFromInteraction.mockReturnValueOnce({});

      // When
      await service.redirectToIdp(reqMock, resMock, idpIdMock);

      // Then
      expect(resMock.redirect).toHaveBeenCalledWith(
        'http://mock-authorize-url',
      );
    });

    it('should throw an error if IdP is not found', async () => {
      // Given
      const idpId = 'invalidIdp';
      identityProviderMock.getById.mockResolvedValueOnce(null);

      // When / Then
      await expect(
        service.redirectToIdp(reqMock, resMock, idpId),
      ).rejects.toThrow(CoreFcaIdpConfigurationException);
    });

    it('should throw an error when IdP is disabled', async () => {
      // Given
      const idpId = 'disabledIdp';
      identityProviderMock.getById.mockResolvedValueOnce({
        name: 'nameMockValue',
        title: 'titleMockValue',
      });

      // When / Then
      await expect(
        service.redirectToIdp(reqMock, resMock, idpId),
      ).rejects.toThrow(CoreFcaAgentIdpDisabledException);
    });

    it('should throw an error when getById throw random error', async () => {
      // Given
      const idpId = 'disabledIdp';
      identityProviderMock.getById.mockRejectedValueOnce(new Error());

      // When / Then
      await expect(
        service.redirectToIdp(reqMock, resMock, idpId),
      ).rejects.toThrow(Error);
    });
  });

  describe('getIdentityProvidersByIds', () => {
    beforeEach(() => {
      configServiceMock.get.mockReturnValue({
        defaultIdpId: 'luciusIdp',
      });
    });
    it('should return the identity providers for the given ids', async () => {
      // Given
      identityProviderMock.getList.mockResolvedValue([
        { ...identityProviderMockResponse, uid: 'dobbyIdp' },
        { ...identityProviderMockResponse, uid: 'horcruxIdp' },
        { ...identityProviderMockResponse, uid: 'luciusIdp' },
        { ...identityProviderMockResponse, uid: 'snapeIdp' },
      ]);

      const { name } = identityProviderMockResponse;
      const idpIds = ['snapeIdp', 'luciusIdp', 'dobbyIdp'];

      // When
      const providers = await service.getIdentityProvidersByIds(idpIds);

      // Then
      expect(providers).toEqual([
        { name, title: 'titleMockValue', uid: 'dobbyIdp' },
        { name, title: 'titleMockValue', uid: 'snapeIdp' },
        { name, title: 'Autre', uid: 'luciusIdp' },
      ]);
    });

    it('should rename the title to "Autre" for the default idp and sort the results', async () => {
      // Given
      identityProviderMock.getList.mockResolvedValue([
        { name: 'Dobby', title: 'Elf', uid: 'dobbyIdp' },
        { name: 'Lucius', title: 'Human', uid: 'luciusIdp' },
        { name: 'Snape', title: 'Wizard', uid: 'snapeIdp' },
      ]);
      const idpIds = ['snapeIdp', 'luciusIdp', 'dobbyIdp'];

      // When
      const providers = await service.getIdentityProvidersByIds(idpIds);

      // Then
      expect(providers).toEqual([
        { name: 'Dobby', title: 'Elf', uid: 'dobbyIdp' },
        { name: 'Snape', title: 'Wizard', uid: 'snapeIdp' },
        { name: 'Lucius', title: 'Autre', uid: 'luciusIdp' },
      ]);
    });
  });

  describe('throwIfFqdnNotAuthorizedForSp', () => {
    it('should return nothing if authorized email configuration is empty', async () => {
      await expect(
        service['throwIfFqdnNotAuthorizedForSp'](spIdMock, 'anyEmail@mail.fr'),
      ).resolves.not.toThrow();
    });

    it('should throw an error if the email is not authorized', async () => {
      coreFcaFqdnServiceMock.getSpAuthorizedFqdnsConfig.mockReturnValueOnce({
        spName: 'Barad-Dur',
        spContact: 'sauron@palantir.morgoth',
        authorizedFqdns: ['mordor.orc'],
      });
      await expect(
        service['throwIfFqdnNotAuthorizedForSp'](
          spIdMock,
          'galadriel@lorien.elve',
        ),
      ).rejects.toThrow();
    });

    it('should return nothing if the email is authorized', async () => {
      coreFcaFqdnServiceMock.getSpAuthorizedFqdnsConfig.mockReturnValueOnce({
        spName: 'Barad-Dur',
        spContact: 'sauron@palantir.morgoth',
        authorizedFqdns: ['mordor.orc'],
      });

      coreFcaFqdnServiceMock.getFqdnConfigFromEmail.mockResolvedValueOnce({
        fqdn: 'mordor.orc',
      });

      await expect(
        service['throwIfFqdnNotAuthorizedForSp'](spIdMock, 'gollum@mordor.orc'),
      ).resolves.not.toThrow();
    });

    it('should return nothing if the config has no authorized fqdns', async () => {
      coreFcaFqdnServiceMock.getSpAuthorizedFqdnsConfig.mockReturnValueOnce({
        spName: 'Barad-Dur',
        spContact: 'sauron@palantir.morgoth',
        authorizedFqdns: [],
      });

      coreFcaFqdnServiceMock.getFqdnConfigFromEmail.mockResolvedValueOnce({
        fqdn: 'mordor.orc',
      });

      await expect(
        service['throwIfFqdnNotAuthorizedForSp'](spIdMock, 'gollum@mordor.orc'),
      ).resolves.not.toThrow();
    });
  });

  describe('hasDefaultIdp', () => {
    it('should return true if defaultIdpId is configured and exists in the IdP list', () => {
      // Given
      configServiceMock.get.mockReturnValue({
        defaultIdpId: 'defaultIdp',
      });

      identityProviderMock.getList.mockResolvedValue([
        { uid: 'idp1' },
        { uid: 'defaultIdp' },
        { uid: 'idp2' },
      ]);

      // When
      const result = service.hasDefaultIdp(['idp1', 'defaultIdp', 'idp2']);

      // Then
      expect(result).toBe(true);
    });

    it('should return false if defaultIdpId is not selected', () => {
      // Given
      configServiceMock.get.mockReturnValue({
        defaultIdpId: 'defaultIdp',
      });

      identityProviderMock.getList.mockResolvedValue([
        { uid: 'idp1' },
        { uid: 'defaultIdp' },
        { uid: 'idp2' },
      ]);

      // When
      const result = service.hasDefaultIdp(['idp1', 'idp2']);

      // Then
      expect(result).toBe(false);
    });

    it('should return false if defaultIdpId is not configured', () => {
      // Given
      configServiceMock.get.mockReturnValue({});

      identityProviderMock.getList.mockResolvedValue([
        { uid: 'idp1' },
        { uid: 'idp2' },
      ]);

      // When
      const result = service.hasDefaultIdp(['idp1', 'idp2', 'defaultIdp']);

      // Then
      expect(result).toBe(false);
    });
  });
});
