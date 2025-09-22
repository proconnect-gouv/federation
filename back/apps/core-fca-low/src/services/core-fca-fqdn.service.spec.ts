import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { FqdnToIdpAdapterMongoService } from '@fc/fqdn-to-idp-adapter-mongo';

import { getConfigMock } from '@mocks/config';

import { CoreFcaFqdnService } from './core-fca-fqdn.service';

describe('CoreFcaFqdnService', () => {
  let service: CoreFcaFqdnService;

  const fqdnToIdpAdapterMongoMock = {
    getIdpsByFqdn: jest.fn(),
    refreshCache: jest.fn(),
    getList: jest.fn(),
    isAllowedIdpForEmail: jest.fn(),
    fetchFqdnToIdpByEmail: jest.fn().mockResolvedValue([]),
  };

  const configServiceMock = getConfigMock();

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaFqdnService,
        FqdnToIdpAdapterMongoService,
        ConfigService,
      ],
    })
      .overrideProvider(FqdnToIdpAdapterMongoService)
      .useValue(fqdnToIdpAdapterMongoMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = app.get<CoreFcaFqdnService>(CoreFcaFqdnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFqdnFromEmail', () => {
    it('should only return the undefined from an undefined email address', () => {
      // When
      const fqdn = service.getFqdnFromEmail(undefined);

      // Then
      expect(fqdn).toBe(undefined);
    });

    it('should only return the full qualified domain name from an email address', () => {
      // When
      const fqdn = service.getFqdnFromEmail('hermione.granger@hogwards.uk');

      // Then
      expect(fqdn).toBe('hogwards.uk');
    });

    it('should only return the full qualified domain name from an email address with two @', () => {
      // When
      const fqdn = service.getFqdnFromEmail(
        'hermione@grangerhogwards@hogwards.uk',
      );

      // Then
      expect(fqdn).toBe('hogwards.uk');
    });

    it('should only return the FQDN from a FQDN', () => {
      // When
      const fqdn = service.getFqdnFromEmail('hogwards.uk');

      // Then
      expect(fqdn).toBe('hogwards.uk');
    });

    const emailToTest = [
      {
        value: 'hermione.granger@hogwards.uK',
        expectedFqdn: 'hogwards.uk',
      },
      {
        value: 'hermione.granger@hogwardS.uk',
        expectedFqdn: 'hogwards.uk',
      },
      {
        value: 'hermione.granger@hogwardS.uK',
        expectedFqdn: 'hogwards.uk',
      },
      {
        value: 'hermione.granger@HOGWARDS.UK',
        expectedFqdn: 'hogwards.uk',
      },
    ];
    it.each(emailToTest)(
      'should always return qualified domain name in lower case from an email address with upper case',
      ({ value, expectedFqdn }) => {
        // When
        const fqdn = service.getFqdnFromEmail(value);

        // Then
        expect(fqdn).toBe(expectedFqdn);
      },
    );
  });

  describe('getFqdnConfigFromEmail', () => {
    it('should return the default idp if no idp is mapped', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      const getFqdnFromEmailSpy = jest.spyOn(service, 'getFqdnFromEmail');
      getFqdnFromEmailSpy.mockReturnValueOnce('hogwards.uk');

      fqdnToIdpAdapterMongoMock.getIdpsByFqdn.mockResolvedValueOnce([]);

      // When
      const response = await service.getFqdnConfigFromEmail('hogwards.uk');

      // Then
      const expectedConfig = {
        fqdn: 'hogwards.uk',
        identityProviderIds: ['default-idp'],
      };

      expect(response).toEqual(expectedConfig);
    });

    it('should return no idps if no idp is mapped for fqdn and no default idp is set', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: '',
      });

      const getFqdnFromEmailSpy = jest.spyOn(service, 'getFqdnFromEmail');
      getFqdnFromEmailSpy.mockReturnValueOnce('hogwards.uk');

      fqdnToIdpAdapterMongoMock.getIdpsByFqdn.mockResolvedValueOnce([]);

      // When
      const response = await service.getFqdnConfigFromEmail('hogwards.uk');

      // Then
      const expectedConfig = {
        fqdn: 'hogwards.uk',
        identityProviderIds: [],
      };

      expect(response).toEqual(expectedConfig);
    });

    it('should return the idps mapped', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      const getFqdnFromEmailSpy = jest.spyOn(service, 'getFqdnFromEmail');
      getFqdnFromEmailSpy.mockReturnValueOnce('hogwards.uk');

      fqdnToIdpAdapterMongoMock.getIdpsByFqdn.mockResolvedValueOnce([
        {
          fqdn: 'hogwards.uk',
          identityProvider: 'idp1',
        },
        {
          fqdn: 'hogwards.uk',
          identityProvider: 'idp2',
        },
      ]);

      // When
      const response = await service.getFqdnConfigFromEmail('hogwards.uk');

      // Then
      const expectedConfig = {
        fqdn: 'hogwards.uk',
        identityProviderIds: ['idp1', 'idp2'],
      };

      expect(response).toEqual(expectedConfig);
    });

    it("should return the idps mapped but not the default idp when there is a default idp but fqdn doesn't accepts default idp", async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      const getFqdnFromEmailSpy = jest.spyOn(service, 'getFqdnFromEmail');
      getFqdnFromEmailSpy.mockReturnValueOnce('hogwards.uk');

      fqdnToIdpAdapterMongoMock.getIdpsByFqdn.mockResolvedValueOnce([
        {
          fqdn: 'hogwards.uk',
          identityProvider: 'idp1',
        },
        {
          fqdn: 'hogwards.uk',
          identityProvider: 'idp2',
        },
      ]);

      // When
      const response = await service.getFqdnConfigFromEmail('hogwards.uk');

      // Then
      const expectedConfig = {
        fqdn: 'hogwards.uk',
        identityProviderIds: ['idp1', 'idp2'],
      };

      expect(response).toEqual(expectedConfig);
    });
  });

  describe('isAllowedIdpForEmail', () => {
    it('should allow a fqdn listed in one of the FqdnToProvider of an idp', async () => {
      // Given
      fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail.mockResolvedValueOnce([
        { identityProvider: 'idp1' },
      ]);

      // When
      const isAllowedIdpForEmail = await service.isAllowedIdpForEmail(
        'idp1',
        'hogwards.uk',
      );

      // Then
      expect(isAllowedIdpForEmail).toEqual(true);
    });

    it('should not allow a fqdn listed in one of the FqdnToProvider of only others idps', async () => {
      // Given
      fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail.mockResolvedValueOnce([
        { identityProvider: 'idp2' },
        { identityProvider: 'idp3' },
      ]);

      // When
      const isAllowedIdpForEmail = await service.isAllowedIdpForEmail(
        'idp1',
        'hogwards.uk',
      );

      // Then
      expect(isAllowedIdpForEmail).toEqual(false);
    });

    it('should allow an unknown fqdn when using the default identity provider', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail.mockResolvedValueOnce([]);

      // When
      const isAllowedIdpForEmail = await service.isAllowedIdpForEmail(
        'default-idp',
        'hogwards.uk',
      );

      // Then
      expect(isAllowedIdpForEmail).toEqual(true);
    });

    it('should not allow an unknown domain when not using the default identity provider', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail.mockResolvedValueOnce([]);

      // When
      const isAllowedIdpForEmail = await service.isAllowedIdpForEmail(
        'not-the-default-idp',
        'hogwards.uk',
      );

      // Then
      expect(isAllowedIdpForEmail).toEqual(false);
    });

    it('should allow a fqdn listed in one of the FqdnToProvider of the default identity provider', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail.mockResolvedValueOnce([
        { identityProvider: 'default-idp' },
      ]);

      // When
      const isAllowedIdpForEmail = await service.isAllowedIdpForEmail(
        'default-idp',
        'beauxbatons.uk',
      );

      // Then
      expect(isAllowedIdpForEmail).toEqual(true);
    });

    it('should not allow a fqdn listed in one of the FqdnToProvider even with a default identity provider activated', async () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'default-idp',
      });

      fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail.mockResolvedValueOnce([
        { identityProvider: 'another-idp' },
      ]);

      // When
      const isAllowedIdpForEmail = await service.isAllowedIdpForEmail(
        'default-idp',
        'beauxbatons.uk',
      );

      // Then
      expect(isAllowedIdpForEmail).toEqual(false);
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
