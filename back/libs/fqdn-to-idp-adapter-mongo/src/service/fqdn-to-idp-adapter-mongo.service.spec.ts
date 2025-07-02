import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@fc/logger';
import { MongooseCollectionOperationWatcherHelper } from '@fc/mongoose';

import { getLoggerMock } from '@mocks/logger';

import { FqdnToIdentityProvider } from '../schemas';
import { FqdnToIdpAdapterMongoService } from './fqdn-to-idp-adapter-mongo.service';

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

jest.mock('class-transformer', () => ({
  ...jest.requireActual('class-transformer'),
  plainToInstance: jest.fn(),
}));

const fqdnToIdps = [
  {
    fqdn: 'default-fqdn.fr',
    identityProvider: 'default provider',
  },
];

describe('FqdnToIdpAdapterMongoService', () => {
  let service: FqdnToIdpAdapterMongoService;

  const repositoryMock = {
    lean: jest.fn(),
    find: jest.fn(),
    sort: jest.fn(),
    watch: jest.fn(),
  };

  const loggerMock = getLoggerMock();

  const mongooseCollectionOperationWatcherHelperMock = {
    connectAllWatchers: jest.fn(),
    watchWith: jest.fn(),
    watch: jest.fn(),
    operationTypeWatcher: jest.fn(),
  };

  const fqdnToProviderModel = getModelToken('FqdnToIdentityProvider');

  const validateMock = jest.mocked(validate);

  const plainToInstanceMock = jest.mocked(plainToInstance);

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FqdnToIdpAdapterMongoService,
        {
          provide: fqdnToProviderModel,
          useValue: repositoryMock,
        },
        LoggerService,
        MongooseCollectionOperationWatcherHelper,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(MongooseCollectionOperationWatcherHelper)
      .useValue(mongooseCollectionOperationWatcherHelperMock)
      .compile();

    service = module.get<FqdnToIdpAdapterMongoService>(
      FqdnToIdpAdapterMongoService,
    );

    repositoryMock.lean.mockResolvedValueOnce(repositoryMock);
    repositoryMock.find.mockReturnValueOnce(repositoryMock);
    repositoryMock.sort.mockReturnValueOnce(repositoryMock);
    plainToInstanceMock.mockImplementation((_dto, obj) => obj);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    beforeEach(() => {
      // Given
      service['getList'] = jest.fn();
    });

    it('should call getList', async () => {
      // When
      await service.onModuleInit();
      // Then
      expect(service['getList']).toHaveBeenCalledTimes(1);
      expect(service['getList']).toHaveBeenCalledWith();
    });

    it('should call watchWith from mongooseHelper', async () => {
      // When
      await service.onModuleInit();
      // Then
      expect(
        mongooseCollectionOperationWatcherHelperMock.watchWith,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshCache', () => {
    beforeEach(() => {
      // Given
      service.getList = jest.fn();
    });
    it('should call getAllFqdnToIdentityProvider method with true value in param', async () => {
      // When
      await service.refreshCache();
      // Then
      expect(service.getList).toHaveBeenCalledTimes(1);
      expect(service.getList).toHaveBeenCalledWith(true);
    });
  });

  describe('getIdpsByFqdn', () => {
    beforeEach(() => {
      const getAllfqdnToIdpsMock = jest.fn();
      getAllfqdnToIdpsMock.mockReturnValueOnce(fqdnToIdps);
      service.getList = getAllfqdnToIdpsMock;
    });

    it('should return a list of FqdnToIdentityProvider', async () => {
      const idpByFqdn = await service.getIdpsByFqdn('default-fqdn.fr');
      expect(idpByFqdn).toStrictEqual(fqdnToIdps);
    });

    it('should return an empty array if no corresponding FI is found for a fqdn', async () => {
      const fqdnToIdps = await service.getIdpsByFqdn('non-existing-fqdn.fr');
      expect(fqdnToIdps).toStrictEqual([]);
    });
  });

  describe('getAllfqdnToIdps', () => {
    beforeEach(() => {
      // Given
      const findAllFqdnToIdentityProviderMock = jest.fn();
      findAllFqdnToIdentityProviderMock.mockReturnValueOnce(fqdnToIdps);
      service['findAllFqdnToIdentityProvider'] =
        findAllFqdnToIdentityProviderMock;
    });

    it('should call findAllFqdnToIdentityProvider when cache is refreshed', async () => {
      // When
      await service.getList(true);

      // Then
      expect(service['findAllFqdnToIdentityProvider']).toHaveBeenCalledTimes(1);
    });

    it('should call findAllFqdnToIdentityProvider when cache is not refreshed but fqdnToIdpCache is null', async () => {
      // When
      service['fqdnToIdpCache'] = null;
      await service.getList(false);

      // Then
      expect(service['findAllFqdnToIdentityProvider']).toHaveBeenCalledTimes(1);
    });

    it('should not call findAllFqdnToIdentityProvider when cache is not refreshed', async () => {
      // When
      service['fqdnToIdpCache'] = fqdnToIdps as FqdnToIdentityProvider[];
      await service.getList(false);

      // Then
      expect(service['findAllFqdnToIdentityProvider']).toHaveBeenCalledTimes(0);
    });

    it('should return the list of idps by fqdn when cache is refreshed', async () => {
      // When
      const response = await service.getList(true);

      // Then
      expect(response).toStrictEqual(fqdnToIdps);
    });

    it('should return the list of idps by fqdn when cache is not refreshed', async () => {
      // When
      service['fqdnToIdpCache'] = fqdnToIdps as FqdnToIdentityProvider[];
      const response = await service.getList(false);

      // Then
      expect(response).toStrictEqual(fqdnToIdps);
    });

    it('should not call findAllFqdnToIdentityProvider method if refreshCache is not set and cache exists', async () => {
      // Given
      service['fqdnToIdpCache'] = fqdnToIdps as FqdnToIdentityProvider[];
      service['findAllFqdnToIdentityProvider'] = jest.fn();

      // When
      const result = await service.getList();

      // Then
      expect(result).toBe(service['fqdnToIdpCache']);
      expect(service['findAllFqdnToIdentityProvider']).toHaveBeenCalledTimes(0);
    });
  });

  describe('findAllFqdnToIdentityProvider', () => {
    beforeEach(() => {
      // Given
      repositoryMock.lean = jest.fn().mockResolvedValueOnce(fqdnToIdps);
    });

    it('should call FqdnToIdentityProviderModel.find().lean()', async () => {
      // Given
      validateMock.mockResolvedValueOnce([]);

      // When
      await service['findAllFqdnToIdentityProvider']();

      // Then
      expect(repositoryMock.lean).toHaveBeenCalledTimes(1);
    });

    it('should return the list of idps', async () => {
      // Given
      validateMock.mockResolvedValueOnce([]);

      // When
      const response = await service['findAllFqdnToIdentityProvider']();

      // Then
      expect(response).toEqual(fqdnToIdps);
    });

    it('should log an alert if an entry is excluded by the DTO', async () => {
      // Given
      validateMock.mockResolvedValueOnce([new ValidationError()]);

      // When
      await service['findAllFqdnToIdentityProvider']();

      // Then
      expect(loggerMock.alert).toHaveBeenCalledTimes(1);
    });

    it('should filter out any entry excluded by the DTO', async () => {
      // Given
      const invalidFqdnToIdp = { notAValidField: 'unused' };
      const validFqdnToIdp = {
        identityProvider: 'validIdp',
        fqdn: 'validFqdn',
      };
      const fqdnToIdpProviderWithInvalidListMock = [
        validFqdnToIdp,
        invalidFqdnToIdp,
      ];

      validateMock
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([new ValidationError()]);

      repositoryMock.lean = jest
        .fn()
        .mockResolvedValueOnce(fqdnToIdpProviderWithInvalidListMock);

      // When
      const response = await service['findAllFqdnToIdentityProvider']();

      // Then
      expect(response).toEqual([validFqdnToIdp]);
    });
  });

  describe('fetchFqdnToIdpByEmail', () => {
    beforeEach(() => {
      service.getIdpsByFqdn = jest.fn();
    });
    it('should extract the FQDN of the email and call getIdpsByFqdn with it', async () => {
      //Given
      const email = 'utilisateur@default-fqdn.fr';
      const fqdn = 'default-fqdn.fr';
      (service.getIdpsByFqdn as jest.Mock).mockResolvedValue(fqdnToIdps);

      // When
      const result = await service.fetchFqdnToIdpByEmail(email);

      // Then
      expect(service.getIdpsByFqdn).toHaveBeenCalledWith(fqdn);
      expect(result).toStrictEqual(fqdnToIdps);
    });

    it('should convert the FQDN to lower case', async () => {
      // Given
      const email = 'utilisateur@DEFAULT-FQDN.FR';
      const fqdnLowerCase = 'default-fqdn.fr';
      (service.getIdpsByFqdn as jest.Mock).mockResolvedValue([]);

      // When
      await service.fetchFqdnToIdpByEmail(email);

      // Then
      expect(service.getIdpsByFqdn).toHaveBeenCalledWith(fqdnLowerCase);
    });
  });
});
