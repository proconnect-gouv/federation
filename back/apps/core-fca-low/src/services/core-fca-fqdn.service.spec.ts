import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';

import { getConfigMock } from '@mocks/config';

import { CoreFcaFqdnService } from './core-fca-fqdn.service';

describe('CoreFcaFqdnService', () => {
  let service: CoreFcaFqdnService;

  const configServiceMock = getConfigMock();
  const identityProviderAdapterMongoMock = {
    getById: jest.fn().mockResolvedValue(undefined),
    getIdpsByFqdn: jest.fn().mockResolvedValue([]),
    getFqdnFromEmail: jest.fn().mockReturnValue(''),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaFqdnService,
        IdentityProviderAdapterMongoService,
        ConfigService,
      ],
    })
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderAdapterMongoMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = app.get<CoreFcaFqdnService>(CoreFcaFqdnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getIdpsFromEmail', () => {
    it('should return the default idp if no idp is mapped', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      identityProviderAdapterMongoMock.getIdpsByFqdn.mockResolvedValueOnce([]);
      identityProviderAdapterMongoMock.getFqdnFromEmail.mockReturnValueOnce(
        'hogwarts.uk',
      );
      // When
      const response = await service.getIdpsFromEmail('hogwarts.uk');

      // Then
      const expectedConfig = {
        fqdn: 'hogwarts.uk',
        identityProviderIds: ['default-idp'],
      };

      expect(response).toEqual(expectedConfig);
    });

    it('should return no idps if no idp is mapped for fqdn and no default idp is set', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: '',
      });

      identityProviderAdapterMongoMock.getFqdnFromEmail.mockReturnValueOnce(
        'hogwarts.uk',
      );
      identityProviderAdapterMongoMock.getIdpsByFqdn.mockResolvedValueOnce([]);

      // When
      const response = await service.getIdpsFromEmail('hogwarts.uk');

      // Then
      const expectedConfig = {
        fqdn: 'hogwarts.uk',
        identityProviderIds: [],
      };

      expect(response).toEqual(expectedConfig);
    });

    it('should return the idps mapped', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      identityProviderAdapterMongoMock.getFqdnFromEmail.mockReturnValueOnce(
        'hogwarts.uk',
      );
      identityProviderAdapterMongoMock.getIdpsByFqdn.mockResolvedValueOnce([
        {
          fqdns: ['hogwarts.uk'],
          uid: 'idp1',
        },
        {
          fqdns: ['hogwarts.uk'],
          uid: 'idp2',
        },
      ]);

      // When
      const response = await service.getIdpsFromEmail('hogwarts.uk');

      // Then
      const expectedConfig = {
        fqdn: 'hogwarts.uk',
        identityProviderIds: ['idp1', 'idp2'],
      };

      expect(response).toEqual(expectedConfig);
    });

    it("should return the idps mapped but not the default idp when there is a default idp but fqdn doesn't accepts default idp", async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      identityProviderAdapterMongoMock.getFqdnFromEmail.mockReturnValueOnce(
        'hogwards.uk',
      );
      identityProviderAdapterMongoMock.getIdpsByFqdn.mockResolvedValueOnce([
        {
          fqdns: ['hogwards.uk'],
          uid: 'idp1',
        },
        {
          fqdns: ['hogwards.uk'],
          uid: 'idp2',
        },
      ]);

      // When
      const response = await service.getIdpsFromEmail('hogwards.uk');

      // Then
      const expectedConfig = {
        fqdn: 'hogwards.uk',
        identityProviderIds: ['idp1', 'idp2'],
      };

      expect(response).toEqual(expectedConfig);
    });
  });

  describe('isAllowedIdpForEmail', () => {
    it('should allow a fqdn listed in one of the fqdns of an idp', async () => {
      // Given
      identityProviderAdapterMongoMock.getById.mockResolvedValueOnce({
        uid: 'idp1',
        fqdns: ['hogwarts.uk'],
      });
      identityProviderAdapterMongoMock.getFqdnFromEmail.mockReturnValueOnce(
        'hogwarts.uk',
      );
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
      identityProviderAdapterMongoMock.getById.mockResolvedValueOnce({
        uid: 'idp1',
        fqdns: ['fqdn1.fr', 'fqdn1bis.fr'],
      });
      identityProviderAdapterMongoMock.getFqdnFromEmail.mockReturnValueOnce(
        'hogwarts.uk',
      );
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
      identityProviderAdapterMongoMock.getById.mockResolvedValueOnce({
        uid: 'default-idp',
        fqdns: [],
      });
      identityProviderAdapterMongoMock.getFqdnFromEmail.mockReturnValueOnce(
        'hogwarts.uk',
      );

      // When
      const isAllowedIdpForEmail = await service.isAllowedIdpForEmail(
        'default-idp',
        'hermione.granger@hogwarts.uk',
      );

      // Then
      expect(isAllowedIdpForEmail).toEqual(true);
    });
  });

  describe('getSpAuthorizedFqdnsConfig', () => {
    it('should return the sp authorized fqdns config', () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        spAuthorizedFqdnsConfigs: [
          {
            spId: 'sp1',
            spName: 'Isengard',
            spContact: 'saruman@palantir.morgoth',
            authorizedFqdns: ['isengard.maia'],
          },
          {
            spId: 'sp2',
            spName: 'Barad-Dur',
            spContact: 'sauron@palantir.morgoth',
            authorizedFqdns: ['mordor.orc'],
          },
        ],
      });

      // When
      expect(service.getSpAuthorizedFqdnsConfig('sp1')).toStrictEqual({
        spId: 'sp1',
        spName: 'Isengard',
        spContact: 'saruman@palantir.morgoth',
        authorizedFqdns: ['isengard.maia'],
      });
    });

    it('should return nothing when the sp authorized fqdns config is empty', () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        spAuthorizedFqdnsConfigs: [],
      });

      // When
      expect(service.getSpAuthorizedFqdnsConfig('sp1')).toStrictEqual(null);
    });
  });
});
