import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LoggerService } from '@fc/logger';
import { AccountService } from './account.service';
import { IInteraction } from './interfaces';

describe('AccountService', () => {
  let service: AccountService;

  const loggerMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
  };

  const accountModel = getModelToken('Account');

  const constructorSpy = jest.fn();
  const findOneSpy = jest.fn();
  class ModelClassMock {
    constructor(obj) {
      constructorSpy(obj);
      return obj;
    }

    static async findOne(...args) {
      return findOneSpy(...args);
    }
  }

  const modelMock = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        LoggerService,
        {
          provide: accountModel,
          useValue: ModelClassMock,
        },
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    service = module.get<AccountService>(AccountService);

    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('storeInteraction', () => {
    // Given
    const identityHash = 'my identityHash';
    const interactionMock = { identityHash } as IInteraction;

    it('should call model save with result from buildInteraction', async () => {
      // Given
      service['getAccountWithInteraction'] = jest
        .fn()
        .mockResolvedValueOnce(modelMock);
      modelMock.save.mockResolvedValueOnce(undefined);

      // When
      await service.storeInteraction(interactionMock);

      // Then
      expect(service['getAccountWithInteraction']).toHaveBeenCalledTimes(1);
      expect(service['getAccountWithInteraction']).toHaveBeenCalledWith(
        interactionMock,
      );
      expect(modelMock.save).toHaveBeenCalledTimes(1);
    });

    it("should throw if it can't retrieve the account", async () => {
      // Given
      service['getAccountWithInteraction'] = jest
        .fn()
        .mockRejectedValueOnce(new Error('test'));

      // Then
      await expect(service.storeInteraction(interactionMock)).rejects.toThrow();
    });

    it('should throw if model update fails', async () => {
      // Given
      service['getAccountWithInteraction'] = jest
        .fn()
        .mockResolvedValueOnce(modelMock);
      modelMock.save.mockRejectedValueOnce(new Error('test'));

      // Then
      await expect(service.storeInteraction(interactionMock)).rejects.toThrow();
    });
  });

  describe('getAccountWithInteraction', () => {
    const identityHash = 'my identityHash mock';

    const newInteractionMock = {
      identityHash,
      idpFederation: { idp1Id: { sub: 'idp1Sub' } },
      spFederation: { sp1Id: { sub: 'sp1Sub' } },
      lastConnection: new Date('2020-05-01'),
    } as IInteraction;

    it('should return an object with idp and sp arrays when no account found', async () => {
      // Given
      findOneSpy.mockResolvedValueOnce(null);
      // When
      const result = await service['getAccountWithInteraction'](
        newInteractionMock,
      );
      // Then
      expect(constructorSpy).toHaveBeenCalledTimes(1);
      expect(constructorSpy).toHaveBeenCalledWith(newInteractionMock);
      expect(result).toEqual({
        identityHash,
        idpFederation: { idp1Id: { sub: 'idp1Sub' } },
        spFederation: { sp1Id: { sub: 'sp1Sub' } },
        lastConnection: new Date('2020-05-01'),
      });
    });
    it('should return an object with idp and sp arrays when an account exists', async () => {
      // Given
      const databaseInteractionMock = {
        identityHash,
        idpFederation: { idp2Id: { sub: 'idp2Sub' } },
        spFederation: { sp2Id: { sub: 'sp2Sub' } },
        lastConnection: new Date('2020-04-15'),
      };
      findOneSpy.mockResolvedValueOnce(databaseInteractionMock);
      // When
      const result = await service['getAccountWithInteraction'](
        newInteractionMock,
      );
      // Then
      expect(constructorSpy).toHaveBeenCalledTimes(0);
      expect(result).toEqual({
        identityHash,
        idpFederation: {
          idp1Id: { sub: 'idp1Sub' },
          idp2Id: { sub: 'idp2Sub' },
        },
        spFederation: {
          sp1Id: { sub: 'sp1Sub' },
          sp2Id: { sub: 'sp2Sub' },
        },
        lastConnection: new Date('2020-05-01'),
      });
    });
  });
  describe('isBlocked', () => {
    const identityHash = 'my identityHash mock';
    it('should request with condition active = false', async () => {
      // When
      await service.isBlocked(identityHash);
      // Then
      expect(findOneSpy).toHaveBeenCalledTimes(1);
      expect(findOneSpy).toHaveBeenCalledWith({
        identityHash,
        active: false,
      });
    });
    it('should return false if no blocked record found', async () => {
      // Given
      findOneSpy.mockResolvedValueOnce(null);
      // When
      const result = await service.isBlocked(identityHash);
      // Then
      expect(result).toBe(false);
    });
    it('should return true if  blocked record found', async () => {
      // Given
      findOneSpy.mockResolvedValueOnce({});
      // When
      const result = await service.isBlocked(identityHash);
      // Then
      expect(result).toBe(true);
    });
  });
});
