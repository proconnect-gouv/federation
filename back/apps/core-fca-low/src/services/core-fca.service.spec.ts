import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { IdentityProviderMetadata } from '@fc/oidc';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';

import {
  CoreFcaAgentIdpDisabledException,
  CoreFcaIdpConfigurationException,
  CoreFcaInvalidEmailDomainException,
} from '../exceptions';
import { CoreFcaService } from './core-fca.service';

describe('CoreFcaService', () => {
  let service: CoreFcaService;

  const configServiceMock = getConfigMock();

  const spIdMock = 'spIdMockValue';

  const loggerMock = getLoggerMock();

  const identityProviderMock = {
    getById: jest.fn(),
    getList: jest.fn(),
    getIdpsByEmail: jest.fn(),
    getFqdnFromEmail: jest.fn(),
  };

  const identityProviderMockResponse = {
    name: 'nameMockValue',
    title: 'titleMockValue',
    active: true,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaService,
        ConfigService,
        IdentityProviderAdapterMongoService,
        LoggerService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    service = app.get<CoreFcaService>(CoreFcaService);

    identityProviderMock.getById.mockResolvedValue(
      identityProviderMockResponse,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ensureEmailIsAuthorizedForSp', () => {
    it('should return nothing if spAuthorizedFqdnsConfigs is empty', () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        spAuthorizedFqdnsConfigs: [],
      });

      // When / Then
      expect(() =>
        service['ensureEmailIsAuthorizedForSp'](spIdMock, 'any-email@mail.fr'),
      ).not.toThrow();
    });

    it('should return nothing if spAuthorizedFqdnsConfigs is not empty but no config is found for the current sp', () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        spAuthorizedFqdnsConfigs: [
          {
            spId: 'sp1',
            spName: 'Barad-Dur',
            spContact: 'sauron@palantir.morgoth',
            authorizedFqdns: ['mordor.orc'],
          },
        ],
      });

      // When / Then
      expect(() =>
        service['ensureEmailIsAuthorizedForSp'](spIdMock, 'frodo@shire.ho'),
      ).not.toThrow();
    });

    it('should throw an error if the email is not authorized', () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        spAuthorizedFqdnsConfigs: [
          {
            spId: spIdMock,
            spName: 'Barad-Dur',
            spContact: 'sauron@palantir.morgoth',
            authorizedFqdns: ['mordor.orc'],
          },
        ],
      });

      // When / Then
      expect(() =>
        service['ensureEmailIsAuthorizedForSp'](
          spIdMock,
          'galadriel@lorien.elve',
        ),
      ).toThrow();
    });

    it('should return nothing if the email is authorized', () => {
      configServiceMock.get.mockReturnValueOnce({
        spAuthorizedFqdnsConfigs: [
          {
            spId: spIdMock,
            spName: 'Barad-Dur',
            spContact: 'sauron@palantir.morgoth',
            authorizedFqdns: ['mordor.orc'],
          },
        ],
      });

      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('mordor.orc');

      expect(() =>
        service['ensureEmailIsAuthorizedForSp'](spIdMock, 'gollum@mordor.orc'),
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

      configServiceMock.get.mockReturnValue({
        defaultIdpId: 'default-idp',
        spAuthorizedFqdnsConfigs: [],
        passeDroitEmailSuffix: '+proconnect',
      });

      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('hogwarts.uk');
      identityProviderMock.getById.mockResolvedValueOnce(mockDefaultIdp);
      identityProviderMock.getIdpsByEmail.mockResolvedValueOnce([]);

      // When
      const response = await service.selectIdpsFromEmail('hogwarts.uk');

      // Then
      expect(response).toEqual([mockDefaultIdp]);
    });

    it('should return no idps if no idp is mapped for fqdn and no default idp is set', async () => {
      // Given
      configServiceMock.get.mockReturnValue({
        defaultIdpId: '',
        passeDroitEmailSuffix: '+proconnect',
      });

      identityProviderMock.getFqdnFromEmail.mockReturnValueOnce('hogwarts.uk');
      identityProviderMock.getIdpsByEmail.mockResolvedValueOnce([]);

      // When
      const response = await service.selectIdpsFromEmail('hogwarts.uk');

      // Then
      expect(response).toEqual([]);
    });

    it('should return the idps mapped', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
        passeDroitEmailSuffix: '+proconnect',
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
      identityProviderMock.getIdpsByEmail.mockResolvedValueOnce(idpsList);

      // When
      const response = await service.selectIdpsFromEmail('hogwarts.uk');

      // Then
      expect(response).toEqual(idpsList);
    });

    it('should return the idps mapped and filter those with routing disabled', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
        passeDroitEmailSuffix: '+proconnect',
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
      identityProviderMock.getIdpsByEmail.mockResolvedValueOnce(idpsList);

      // When
      const response = await service.selectIdpsFromEmail('hogwarts.uk');

      // Then
      expect(response).toEqual([idpsList[0]]);
    });

    it('should return the idps mapped even with routing disabled if the email is a passe-droit', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
        passeDroitEmailSuffix: '+proconnect',
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
      identityProviderMock.getIdpsByEmail.mockResolvedValueOnce(idpsList);

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
        passeDroitEmailSuffix: '+proconnect',
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
      identityProviderMock.getIdpsByEmail.mockResolvedValueOnce(idpsList);

      // When
      const response = await service.selectIdpsFromEmail(
        'hermione.granger+proconnect.not-at-the-end@hogwarts.uk',
      );

      // Then
      expect(response).toEqual([idpsList[0]]);
    });
  });

  describe('ensureIdpCanServeThisEmail', () => {
    beforeEach(() => {
      configServiceMock.get.mockReturnValue({
        defaultIdpId: 'default-idp',
        supportEmail: 'support@example.com',
      });
      identityProviderMock.getFqdnFromEmail.mockReturnValue('hogwarts.uk');
    });

    it('should not throw if idp can serve email domain', async () => {
      identityProviderMock.getById.mockResolvedValueOnce({
        uid: 'idp1',
        fqdns: ['hogwarts.uk'],
        isBlockingForUnlistedEmailDomainsEnabled: true,
      });

      const res = await service.ensureIdpCanServeThisEmail(
        'idp1',
        'hermione.granger@hogwarts.uk',
      );

      expect(res).toBeUndefined();
    });

    it('should not throw if blocking is disabled for idp', async () => {
      identityProviderMock.getById.mockResolvedValueOnce({
        uid: 'idp1',
        fqdns: ['fqdn1.fr', 'fqdn1bis.fr'],
        isBlockingForUnlistedEmailDomainsEnabled: false,
      });

      const res = await service.ensureIdpCanServeThisEmail(
        'idp1',
        'hermione.granger@hogwarts.uk',
      );

      expect(res).toBeUndefined();
    });

    it('should not throw when domain is listed in extraDomainList', async () => {
      identityProviderMock.getById.mockResolvedValueOnce({
        uid: 'idp1',
        fqdns: ['fqdn1.fr', 'fqdn1bis.fr'],
        extraAcceptedEmailDomains: ['hogwarts.uk'],
        isBlockingForUnlistedEmailDomainsEnabled: true,
      });

      const res = await service.ensureIdpCanServeThisEmail(
        'idp1',
        'hermione.granger@hogwarts.uk',
      );

      expect(res).toBeUndefined();
    });

    it('should not throw when using default fqdn', async () => {
      identityProviderMock.getById.mockResolvedValueOnce({
        uid: 'default-idp',
        fqdns: ['fqdn1.fr'],
        isBlockingForUnlistedEmailDomainsEnabled: true,
      });

      const res = await service.ensureIdpCanServeThisEmail(
        'default-idp',
        'hermione.granger@hogwarts.uk',
      );

      expect(res).toBeUndefined();
    });

    it('should throw when none of the above conditions is fulfilled', async () => {
      identityProviderMock.getById.mockResolvedValueOnce({
        uid: 'idp1',
        fqdns: ['fqdn1.fr'],
        isBlockingForUnlistedEmailDomainsEnabled: true,
      });

      await expect(
        service.ensureIdpCanServeThisEmail(
          'idp1',
          'hermione.granger@hogwarts.uk',
        ),
      ).rejects.toThrow(CoreFcaInvalidEmailDomainException);
    });
  });

  describe('getSortedDisplayableIdentityProviders', () => {
    it('should sort providers by title alphabetically with the default IdP at the end of the list', () => {
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
        { uid: 'idp2', title: 'Autre (via ProConnect Identité)' },
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

    it('should convert default idp title to "Autre (via ProConnect Identité)"', () => {
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
      expect(sortedProviders).toEqual([
        { uid: 'idp1', title: 'Autre (via ProConnect Identité)' },
      ]);
    });
  });

  describe('safelyGetExistingAndEnabledIdp', () => {
    it('should return the idp when it exists and is active', async () => {
      // Given
      const idp = {
        uid: 'idp-active',
        active: true,
      } as unknown as IdentityProviderMetadata;
      identityProviderMock.getById.mockResolvedValueOnce(idp);

      // When
      const result =
        await service['safelyGetExistingAndEnabledIdp']('idp-active');

      // Then
      expect(result).toBe(idp);
    });

    it('should throw CoreFcaIdpConfigurationException when idp does not exist', async () => {
      // Given
      identityProviderMock.getById.mockResolvedValueOnce(null);

      // When / Then
      await expect(
        service['safelyGetExistingAndEnabledIdp']('unknown-idp'),
      ).rejects.toBeInstanceOf(CoreFcaIdpConfigurationException);
    });

    it('should throw CoreFcaAgentIdpDisabledException when idp is inactive', async () => {
      // Given
      const idp = {
        uid: 'idp-inactive',
        active: false,
      } as unknown as IdentityProviderMetadata;
      identityProviderMock.getById.mockResolvedValueOnce(idp);

      // When / Then
      await expect(
        service['safelyGetExistingAndEnabledIdp']('idp-inactive'),
      ).rejects.toBeInstanceOf(CoreFcaAgentIdpDisabledException);
    });
  });
});
