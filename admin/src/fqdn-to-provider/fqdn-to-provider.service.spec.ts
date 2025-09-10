import { Test, TestingModule } from '@nestjs/testing';
import { FqdnToProviderService } from './fqdn-to-provider.service';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { FqdnToProvider } from './fqdn-to-provider.mongodb.entity';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { fqdnToProviderFactory } from './fixture';
import { identityProviderFactory } from '../identity-provider';

jest.mock('uuid');

describe('FqdnToProviderService', () => {
  let module: TestingModule;
  let fqdnToProviderService: FqdnToProviderService;

  const fqdnToProviderRepository = {
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([FqdnToProvider], 'fc-mongo')],
      providers: [FqdnToProviderService, MongoRepository],
    })
      .overrideProvider(getRepositoryToken(FqdnToProvider, 'fc-mongo'))
      .useValue(fqdnToProviderRepository)

      .compile();

    fqdnToProviderService = module.get<FqdnToProviderService>(
      FqdnToProviderService,
    );

    jest.resetAllMocks();
  });

  afterAll(async () => {
    module.close();
  });

  describe('findFqdnsForOneProvider', () => {
    it('should return all fqdns for one identity provider', async () => {
      // Given
      const fqdnToProviders = [
        {
          identityProvider: 'mock-id-1',
          fqdn: 'stendhal.fr',
        },
        {
          identityProvider: 'mock-id-1',
          fqdn: 'flaubert.fr',
        },
      ].map(fqdnToProviderFactory.createFqdnToProvider);
      fqdnToProviderRepository.find.mockReturnValueOnce(fqdnToProviders);

      // When
      const result =
        await fqdnToProviderService['findFqdnsForOneProvider']('mock-id-1');

      // Then
      expect(result).toStrictEqual(fqdnToProviders);
    });

    it('should return an empty array if no fqdn has been found', async () => {
      // Given
      const mockResponse = [];
      fqdnToProviderRepository.find.mockReturnValueOnce(mockResponse);

      // Then
      const result =
        await fqdnToProviderService['findFqdnsForOneProvider']('mock-id-1');
      expect(result).toStrictEqual([]);
    });
  });

  describe('findFqdnsForProviders', () => {
    it('should return all fqdns for a list of identity providers', async () => {
      // Given
      const fqdnToProviders = [
        {
          identityProvider: 'mock-id-1',
          fqdn: 'stendhal.fr',
        },
        {
          identityProvider: 'mock-id-1',
          fqdn: 'flaubert.fr',
        },
        {
          identityProvider: 'mock-id-2',
          fqdn: 'duras.fr',
        },
      ].map(fqdnToProviderFactory.createFqdnToProvider);
      fqdnToProviderRepository.find.mockReturnValueOnce(fqdnToProviders);

      // When
      const result = await fqdnToProviderService['findFqdnsForProviders']([
        'mock-id-1',
        'mock-id-2',
      ]);

      // Then
      expect(result).toStrictEqual(fqdnToProviders);
    });
  });

  describe('getFqdnsForIdentityProviderUid', () => {
    const uid = 'mock-id-1';

    it('should return an identity provider with its fqdns', async () => {
      // Given
      const fqdnToProviders = [
        {
          identityProvider: uid,
          fqdn: 'stendhal.fr',
        },
        {
          identityProvider: uid,
          fqdn: 'flaubert.fr',
        },
      ].map(fqdnToProviderFactory.createFqdnToProvider);
      fqdnToProviderRepository.find.mockReturnValueOnce(fqdnToProviders);

      // When
      const result =
        await fqdnToProviderService.getFqdnsForIdentityProviderUid(uid);

      // Then
      expect(result).toStrictEqual(['stendhal.fr', 'flaubert.fr']);
    });

    it('should return an identity provider without fqdns if there is no associations', async () => {
      // Given
      fqdnToProviderRepository.find.mockReturnValueOnce([]);

      // When
      const result =
        await fqdnToProviderService.getFqdnsForIdentityProviderUid(uid);

      // Then
      expect(result).toStrictEqual([]);
    });
  });

  describe('getProvidersWithFqdns', () => {
    it('should returns idps with fqdns', async () => {
      // Given
      const identityProvider1 =
        identityProviderFactory.createIdentityProviderFromDb({
          uid: 'mock-id-1',
        });
      const identityProvider2 =
        identityProviderFactory.createIdentityProviderFromDb({
          uid: 'mock-id-2',
        });
      const identityProviders = [identityProvider1, identityProvider2];

      const fqdns = [
        {
          identityProvider: 'mock-id-1',
          fqdn: 'stendhal.fr',
        },
        {
          identityProvider: 'mock-id-1',
          fqdn: 'flaubert.fr',
        },
        {
          identityProvider: 'mock-id-2',
          fqdn: 'duras.fr',
        },
      ].map(fqdnToProviderFactory.createFqdnToProvider);

      const expectedResult = [
        {
          ...identityProvider1,
          fqdns: ['stendhal.fr', 'flaubert.fr'],
        },
        {
          ...identityProvider2,

          fqdns: ['duras.fr'],
        },
      ];

      fqdnToProviderRepository.find.mockReturnValueOnce(fqdns);

      // When
      const result =
        await fqdnToProviderService.getProvidersWithFqdns(identityProviders);

      // Then
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('saveFqdnsProvider', () => {
    it('should save fqdns for an identity provider', async () => {
      // Given
      const identityProviderUid = 'mock-id-1';
      const fqdns = ['stendhal.fr', 'flaubert.fr'];

      // When
      await fqdnToProviderService.saveFqdnsProvider(identityProviderUid, fqdns);

      // Then
      expect(fqdnToProviderRepository.save).toHaveBeenCalledTimes(2);
      expect(fqdnToProviderRepository.save).toHaveBeenNthCalledWith(1, {
        identityProvider: identityProviderUid,
        fqdn: fqdns[0],
        acceptsDefaultIdp: true,
      });
      expect(fqdnToProviderRepository.save).toHaveBeenNthCalledWith(2, {
        identityProvider: identityProviderUid,
        fqdn: fqdns[1],
        acceptsDefaultIdp: true,
      });
    });

    it('should not save an empty fqdn', async () => {
      // Given
      const identityProviderUid = 'mock-id-1';
      const fqdns = ['stendhal.fr', ''];

      // When
      fqdnToProviderRepository.save.mockReturnValueOnce(null);

      await fqdnToProviderService.saveFqdnsProvider(identityProviderUid, fqdns);

      // Then
      expect(fqdnToProviderRepository.save).toHaveBeenCalledTimes(1);
      expect(fqdnToProviderRepository.save).toHaveBeenCalledWith({
        identityProvider: identityProviderUid,
        fqdn: fqdns[0],
        acceptsDefaultIdp: true,
      });
    });
  });

  describe('deleteFqdnsProvider', () => {
    const objectId1 = new ObjectId('648c1742c74d6a3d84b31943');
    const objectId2 = new ObjectId('abcc1742c74d6fad84b31943');
    it('should delete fqdns for an identity provider', async () => {
      // Given
      const identityProviderUid = 'mock-id-1';
      const existingFqdns = [
        {
          _id: objectId1,
          identityProvider: identityProviderUid,
          fqdn: 'stendhal.fr',
        },
        {
          _id: objectId2,
          identityProvider: identityProviderUid,
          fqdn: 'flaubert.fr',
        },
      ].map(fqdnToProviderFactory.createFqdnToProvider);

      // When
      fqdnToProviderRepository.find.mockReturnValueOnce(existingFqdns);

      await fqdnToProviderService['deleteFqdnsProvider'](identityProviderUid);

      // Then
      expect(fqdnToProviderRepository.find).toHaveBeenCalledTimes(1);
      expect(fqdnToProviderRepository.find).toHaveBeenCalledWith({
        where: {
          identityProvider: identityProviderUid,
        },
      });

      expect(fqdnToProviderRepository.delete).toHaveBeenCalledTimes(1);
      expect(fqdnToProviderRepository.delete).toHaveBeenCalledWith({
        _id: { $in: [objectId1, objectId2] },
      });
    });

    it('should not delete fqdns for an identity provider if there is no fqdn', async () => {
      // Given
      const identityProviderUid = 'mock-id-1';
      const existingFqdns = [];

      // When
      fqdnToProviderRepository.find.mockReturnValueOnce(existingFqdns);

      await fqdnToProviderService['deleteFqdnsProvider'](identityProviderUid);

      // Then
      expect(fqdnToProviderRepository.find).toHaveBeenCalledTimes(1);
      expect(fqdnToProviderRepository.find).toHaveBeenCalledWith({
        where: {
          identityProvider: identityProviderUid,
        },
      });

      expect(fqdnToProviderRepository.delete).toHaveBeenCalledTimes(0);
    });
  });

  describe('updateFqdnsProvider', () => {
    it('should update fqdns for an identity provider', async () => {
      // Given
      const identityProviderUid = 'mock-id-1';

      const newFqdns = ['stendhal.fr', 'balzac.fr'];
      const deleteFqdnsProviderSpy = jest
        .spyOn(fqdnToProviderService, 'deleteFqdnsProvider')
        .mockImplementation(() => Promise.resolve());

      fqdnToProviderRepository.find.mockReturnValueOnce([
        // we remove "flaubert.fr" from the existing fqdns
        {
          fqdn: 'stendhal.fr',
          acceptsDefaultIdp: true,
        },
      ]);

      // When
      await fqdnToProviderService.updateFqdnsProvider(
        identityProviderUid,
        newFqdns,
      );

      // Then
      expect(deleteFqdnsProviderSpy).toHaveBeenCalledTimes(1);
      expect(deleteFqdnsProviderSpy).toHaveBeenCalledWith(identityProviderUid);

      expect(fqdnToProviderRepository.save).toHaveBeenCalledTimes(2);
      expect(fqdnToProviderRepository.save).toHaveBeenNthCalledWith(1, {
        identityProvider: identityProviderUid,
        fqdn: newFqdns[0],
        acceptsDefaultIdp: true,
      });
      expect(fqdnToProviderRepository.save).toHaveBeenNthCalledWith(2, {
        identityProvider: identityProviderUid,
        fqdn: newFqdns[1],
        acceptsDefaultIdp: true,
      });
    });

    it('should not update fqdns acceptance for an existing fqdn when another fqdn is updated', async () => {
      // Given
      const identityProviderUid = 'mock-id-1';
      const existingFqdns = [
        {
          identityProvider: identityProviderUid,
          fqdn: 'balzac.fr',
        },
        {
          identityProvider: identityProviderUid,
          fqdn: 'flaubert.fr',
        },
      ].map(fqdnToProviderFactory.createFqdnToProvider);
      const newFqdns = ['balzac.fr', 'flaubert.fr', 'yourcenar.fr'];
      const deleteFqdnsProviderSpy = jest
        .spyOn(fqdnToProviderService, 'deleteFqdnsProvider')
        .mockImplementation(() => Promise.resolve());

      // When
      fqdnToProviderRepository.find.mockReturnValueOnce(existingFqdns);

      await fqdnToProviderService['updateFqdnsProvider'](
        identityProviderUid,
        newFqdns,
      );

      // Then
      expect(deleteFqdnsProviderSpy).toHaveBeenCalledTimes(1);
      expect(deleteFqdnsProviderSpy).toHaveBeenCalledWith(identityProviderUid);

      expect(fqdnToProviderRepository.save).toHaveBeenCalledTimes(3);
      expect(fqdnToProviderRepository.save).toHaveBeenNthCalledWith(1, {
        identityProvider: identityProviderUid,
        fqdn: newFqdns[0],
        acceptsDefaultIdp: true,
      });
      expect(fqdnToProviderRepository.save).toHaveBeenNthCalledWith(2, {
        identityProvider: identityProviderUid,
        fqdn: newFqdns[1],
        acceptsDefaultIdp: true,
      });
      expect(fqdnToProviderRepository.save).toHaveBeenNthCalledWith(3, {
        identityProvider: identityProviderUid,
        fqdn: newFqdns[2],
        acceptsDefaultIdp: true,
      });
    });

    it('should update even when there is no existing fqdn for a provider', async () => {
      // Given
      const identityProviderUid = 'mock-id-1';
      const existingFqdns = [];
      const newFqdns = ['duras.fr', 'balzac.fr'];

      // When
      fqdnToProviderRepository.find.mockReturnValue(existingFqdns);

      await fqdnToProviderService.updateFqdnsProvider(
        identityProviderUid,
        newFqdns,
      );

      // Then
      expect(fqdnToProviderRepository.delete).toHaveBeenCalledTimes(0);

      expect(fqdnToProviderRepository.save).toHaveBeenCalledTimes(2);
      expect(fqdnToProviderRepository.save).toHaveBeenNthCalledWith(1, {
        identityProvider: identityProviderUid,
        fqdn: newFqdns[0],
        acceptsDefaultIdp: true,
      });
      expect(fqdnToProviderRepository.save).toHaveBeenNthCalledWith(2, {
        identityProvider: identityProviderUid,
        fqdn: newFqdns[1],
        acceptsDefaultIdp: true,
      });
    });

    it('should should not call save() but call deleteFqdnSProvider()  when there is no fqdn to update', async () => {
      // Given
      const identityProviderUid = 'mock-id-1';
      const newFqdns = [];
      const deleteFqdnsProviderSpy = jest
        .spyOn(fqdnToProviderService, 'deleteFqdnsProvider')
        .mockImplementation(() => Promise.resolve());

      // When
      fqdnToProviderRepository.find.mockReturnValueOnce([]);

      await fqdnToProviderService['updateFqdnsProvider'](
        identityProviderUid,
        newFqdns,
      );

      // Then
      expect(deleteFqdnsProviderSpy).toHaveBeenCalledTimes(1);
      expect(deleteFqdnsProviderSpy).toHaveBeenCalledWith(identityProviderUid);

      expect(fqdnToProviderRepository.save).toHaveBeenCalledTimes(0);
    });
  });

  describe('aggregateFqdnToProviderWithIdentityProvider', () => {
    it('should add fqdns to identity providers', async () => {
      // Given
      const identityProvider1 =
        identityProviderFactory.createIdentityProviderFromDb({
          uid: 'mock-id-1',
          name: 'mock-identity-provider-name-1',
        });
      const identityProvider2 =
        identityProviderFactory.createIdentityProviderFromDb({
          uid: 'mock-id-2',
          name: 'mock-identity-provider-name-2',
        });
      const identityProviders = [identityProvider1, identityProvider2];

      const fqdns = [
        {
          identityProvider: 'mock-id-1',
          fqdn: 'stendhal.fr',
        },
        {
          identityProvider: 'mock-id-1',
          fqdn: 'flaubert.fr',
        },
        {
          identityProvider: 'mock-id-2',
          fqdn: 'duras.fr',
        },
      ].map(fqdnToProviderFactory.createFqdnToProvider);

      const expectedResult = [
        {
          ...identityProvider1,
          fqdns: ['stendhal.fr', 'flaubert.fr'],
        },
        {
          ...identityProvider2,
          fqdns: ['duras.fr'],
        },
      ];

      // When
      const result = fqdnToProviderService[
        'aggregateFqdnToProviderWithIdentityProvider'
      ](identityProviders, fqdns);

      // Then
      expect(result).toStrictEqual(expectedResult);
    });
  });
});
