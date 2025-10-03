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

  describe('getSpAuthorizedFqdnsDetails', () => {
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
      expect(service.getSpAuthorizedFqdnsDetails('sp1')).toStrictEqual({
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
      expect(service.getSpAuthorizedFqdnsDetails('sp1')).toStrictEqual(null);
    });
  });
});
