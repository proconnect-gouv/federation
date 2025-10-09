import { Request, Response } from 'express';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { IdentityProviderMetadata } from '@fc/oidc';
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
    getIdpsByFqdn: jest.fn(),
    getFqdnFromEmail: jest.fn(),
  };

  const identityProviderMockResponse = {
    name: 'nameMockValue',
    title: 'titleMockValue',
    active: true,
  };

  const nonceMock = Symbol('nonceMockValue');
  const stateMock = Symbol('stateMockValue');

  const authorizeUrlMock = Symbol('authorizeUrlMockValue');

  const coreAuthorizationServiceMock = {
    getAuthorizeUrl: jest.fn(),
  };

  const coreFcaFqdnServiceMock = {
    getSpAuthorizedFqdnsDetails: jest.fn(),
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

  describe('throwIfFqdnIsNotAuthorizedForSp', () => {
    it('should return nothing if authorized email configuration is empty', () => {
      expect(() =>
        service['throwIfFqdnIsNotAuthorizedForSp'](
          spIdMock,
          'anyEmail@mail.fr',
        ),
      ).not.toThrow();
    });

    it('should throw an error if the email is not authorized', () => {
      coreFcaFqdnServiceMock.getSpAuthorizedFqdnsDetails.mockReturnValueOnce({
        spName: 'Barad-Dur',
        spContact: 'sauron@palantir.morgoth',
        authorizedFqdns: ['mordor.orc'],
      });
      expect(() =>
        service['throwIfFqdnIsNotAuthorizedForSp'](
          spIdMock,
          'galadriel@lorien.elve',
        ),
      ).toThrow();
    });

    it('should return nothing if the email is authorized', () => {
      coreFcaFqdnServiceMock.getSpAuthorizedFqdnsDetails.mockReturnValueOnce({
        spName: 'Barad-Dur',
        spContact: 'sauron@palantir.morgoth',
        authorizedFqdns: ['mordor.orc'],
      });

      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('mordor.orc');

      expect(() =>
        service['throwIfFqdnIsNotAuthorizedForSp'](
          spIdMock,
          'gollum@mordor.orc',
        ),
      ).not.toThrow();
    });

    it('should return nothing if the config has no authorized fqdns', () => {
      coreFcaFqdnServiceMock.getSpAuthorizedFqdnsDetails.mockReturnValueOnce({
        spName: 'Barad-Dur',
        spContact: 'sauron@palantir.morgoth',
        authorizedFqdns: [],
      });

      expect(() =>
        service['throwIfFqdnIsNotAuthorizedForSp'](
          spIdMock,
          'gollum@mordor.orc',
        ),
      ).not.toThrow();
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

  describe('selectIdpsFromEmail', () => {
    it('should return the default idp if no idp is mapped', async () => {
      // Given
      const mockDefaultIdp = {
        uid: 'default-idp',
      } as unknown as IdentityProviderMetadata;
      identityProviderMock.getById.mockResolvedValueOnce(mockDefaultIdp);

      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      identityProviderMock.getIdpsByFqdn.mockResolvedValueOnce([]);
      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('hogwarts.uk');

      // When
      const response = await service.selectIdpsFromEmail('hogwarts.uk');

      // Then
      expect(response).toEqual([mockDefaultIdp]);
    });

    it('should return no idps if no idp is mapped for fqdn and no default idp is set', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: '',
      });

      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('hogwarts.uk');
      identityProviderMock.getIdpsByFqdn.mockResolvedValueOnce([]);

      // When
      const response = await service.selectIdpsFromEmail('hogwarts.uk');

      // Then
      expect(response).toEqual([]);
    });

    it('should return the idps mapped', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      const idpsList = [
        {
          uid: 'idp1',
          isRoutingEnabled: true,
        },
        {
          uid: 'idp2',
          isRoutingEnabled: true,
        },
      ];

      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('hogwarts.uk');
      identityProviderMock.getIdpsByFqdn.mockResolvedValueOnce(idpsList);

      // When
      const response = await service.selectIdpsFromEmail('hogwarts.uk');

      // Then
      expect(response).toEqual(idpsList);
    });

    it('should return the idps mapped and filter those with routing disabled', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      const idpsList = [
        {
          uid: 'idp1',
          isRoutingEnabled: true,
        },
        {
          uid: 'idp2',
          isRoutingEnabled: false,
        },
      ];

      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('hogwarts.uk');
      identityProviderMock.getIdpsByFqdn.mockResolvedValueOnce(idpsList);

      // When
      const response = await service.selectIdpsFromEmail('hogwarts.uk');

      // Then
      expect(response).toEqual([idpsList[0]]);
    });

    it('should return the idps mapped even with routing disabled if the email is a passe-droit', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      const idpsList = [
        {
          uid: 'idp1',
          isRoutingEnabled: true,
        },
        {
          uid: 'idp2',
          isRoutingEnabled: false,
        },
      ];

      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('hogwarts.uk');
      identityProviderMock.getIdpsByFqdn.mockResolvedValueOnce(idpsList);

      // When
      const response = await service.selectIdpsFromEmail(
        'hermione.granger+proconnect@hogwarts.uk',
      );

      // Then
      expect(response).toEqual(idpsList);
    });

    it('should not return the idps mapped with routing disabled if the email is a wrong configured passe-droit', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      const idpsList = [
        {
          uid: 'idp1',
          isRoutingEnabled: true,
        },
        {
          uid: 'idp2',
          isRoutingEnabled: false,
        },
      ];

      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('hogwarts.uk');
      identityProviderMock.getIdpsByFqdn.mockResolvedValueOnce(idpsList);

      // When
      const response = await service.selectIdpsFromEmail(
        'hermione.granger+proconnect.not-at-the-end@hogwarts.uk',
      );

      // Then
      expect(response).toEqual([idpsList[0]]);
    });
  });

  describe('isAllowedIdpForEmail', () => {
    it('should allow a fqdn listed in one of the fqdns of an idp', async () => {
      // Given
      identityProviderMock.getById.mockResolvedValueOnce({
        uid: 'idp1',
        fqdns: ['hogwarts.uk'],
      });
      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('hogwarts.uk');
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      // When
      const isAllowedIdpForEmail = await service.isAllowedIdpForEmail(
        'idp1',
        'hermione.granger@hogwarts.uk',
      );

      // Then
      expect(isAllowedIdpForEmail).toEqual(true);
    });

    it('should not allow a fqdn listed in one of the fqdns of only others idps', async () => {
      // Given
      identityProviderMock.getById.mockResolvedValueOnce({
        uid: 'idp1',
        fqdns: ['fqdn1.fr', 'fqdn1bis.fr'],
      });
      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('hogwarts.uk');
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      // When
      const isAllowedIdpForEmail = await service.isAllowedIdpForEmail(
        'idp1',
        'hermione.granger@hogwarts.uk',
      );

      // Then
      expect(isAllowedIdpForEmail).toEqual(false);
    });

    it('should allow an unknown fqdn when using the default identity provider', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });
      identityProviderMock.getById.mockResolvedValueOnce({
        uid: 'default-idp',
        fqdns: [],
      });
      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('hogwarts.uk');

      // When
      const isAllowedIdpForEmail = await service.isAllowedIdpForEmail(
        'default-idp',
        'hermione.granger@hogwarts.uk',
      );

      // Then
      expect(isAllowedIdpForEmail).toEqual(true);
    });
  });

  describe('getSortedDisplayableIdentityProviders', () => {
    it('should sort identity providers alphabetically with "Autre" at the end of the list', () => {
      // Given
      configServiceMock.get.mockReturnValue({
        defaultIdpId: 'idp2',
      });

      const identityProviders = [
        { uid: 'idp1', title: 'Zeta' },
        { uid: 'idp2', title: 'Alpha' },
        { uid: 'idp3', title: 'Beta' },
      ] as unknown as IdentityProviderMetadata[];

      // When
      const sortedProviders =
        service.getSortedDisplayableIdentityProviders(identityProviders);

      // Then
      expect(sortedProviders).toEqual([
        { uid: 'idp3', title: 'Beta' },
        { uid: 'idp1', title: 'Zeta' },
        { uid: 'idp2', title: 'Autre' },
      ]);
    });

    it('should handle empty identity provider list', () => {
      // Given
      configServiceMock.get.mockReturnValue({
        defaultIdpId: 'idp2',
      });

      const identityProviders: IdentityProviderMetadata[] = [];

      // When
      const sortedProviders =
        service.getSortedDisplayableIdentityProviders(identityProviders);

      // Then
      expect(sortedProviders).toEqual([]);
    });

    it('should convert default idp title to "Autre"', () => {
      // Given
      configServiceMock.get.mockReturnValue({
        defaultIdpId: 'idp1',
      });

      const identityProviders = [
        { uid: 'idp1', title: 'Original Title' },
      ] as unknown as IdentityProviderMetadata[];

      // When
      const sortedProviders =
        service.getSortedDisplayableIdentityProviders(identityProviders);

      // Then
      expect(sortedProviders).toEqual([{ uid: 'idp1', title: 'Autre' }]);
    });
  });
});
