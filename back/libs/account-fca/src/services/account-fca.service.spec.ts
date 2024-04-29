import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@fc/logger';

import { getLoggerMock } from '@mocks/logger';

import { AccountFca } from '../schemas';
import { AccountFcaService } from './account-fca.service';

describe('AccountFcaService', () => {
  let service: AccountFcaService;

  const loggerMock = getLoggerMock();

  const accountFcaModel = getModelToken('AccountFca');

  const constructorMock = jest.fn();

  const findOneMock = jest.fn();
  const findOneAndUpdateMock = jest.fn();

  class ModelClassMock {
    constructor(obj) {
      constructorMock(obj);
      return obj;
    }

    // Actually async
    // eslint-disable-next-line require-await
    static async findOne(...args) {
      return findOneMock(...args);
    }

    // Actually async
    // eslint-disable-next-line require-await
    static async findOneAndUpdate(...args) {
      return findOneAndUpdateMock(...args);
    }
  }

  const accountMock = {
    id: 'Account Mock Id Value',
    lastConnection: new Date('2023-04-25T21:44:02.968Z'),
  } as AccountFca;

  const modelMock = {
    ...accountMock,
    save: jest.fn(),
  };

  const interactionMock = {
    sub: 'Sub Value',
    lastConnection: new Date('2024-04-25T21:44:02.968Z'),
    idpSub: 'Idp Sub Value',
    idpUid: 'Idp Uid Value',
  };

  const idpIdentityKeyMock = {
    idpSub: interactionMock.idpSub,
    idpUid: interactionMock.idpUid,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountFcaService,
        LoggerService,
        {
          provide: accountFcaModel,
          useValue: ModelClassMock,
        },
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    service = module.get<AccountFcaService>(AccountFcaService);

    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveInteraction()', () => {
    it('should call save interaction with correct params', async () => {
      // Given
      service['getAccountWithSub'] = jest.fn().mockReturnValueOnce(modelMock);
      modelMock.save.mockResolvedValueOnce(undefined);

      // When
      await service.saveInteraction(interactionMock);

      // Then
      expect(service['getAccountWithSub']).toHaveBeenCalledTimes(1);
      expect(service['getAccountWithSub']).toHaveBeenCalledWith(
        interactionMock,
        undefined,
      );
      expect(modelMock.save).toHaveBeenCalledTimes(1);
    });

    it('should return an account', async () => {
      // Given
      service['getAccountWithSub'] = jest.fn().mockReturnValueOnce(modelMock);

      // When
      const result = await service.saveInteraction(interactionMock);

      // Then
      expect(result).toBe(modelMock);
    });

    it("should throw if it can't retrieve the account", async () => {
      // Given
      service['getAccountWithSub'] = jest
        .fn()
        .mockReturnValueOnce(new Error('test'));

      // Then
      await expect(service.saveInteraction(interactionMock)).rejects.toThrow();
    });

    it('should throw if model update fails', async () => {
      // Given
      service['getAccountWithInteraction'] = jest
        .fn()
        .mockResolvedValueOnce(modelMock);
      modelMock.save.mockReturnValueOnce(new Error('test'));

      // Then
      await expect(service.saveInteraction(interactionMock)).rejects.toThrow();
    });
  });

  describe('getAccountByIdpAgentKeys()', () => {
    it('should call findOne with correct params', async () => {
      // Given
      findOneMock.mockResolvedValueOnce(modelMock);

      // When
      await service.getAccountByIdpAgentKeys(idpIdentityKeyMock);

      // Then
      expect(findOneMock).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith({
        idpIdentityKeys: idpIdentityKeyMock,
      });
    });

    it('should return an account if findOne returns one', async () => {
      // Given
      findOneMock.mockResolvedValueOnce(modelMock);

      // When
      const result = await service.getAccountByIdpAgentKeys(idpIdentityKeyMock);

      // Then
      expect(result).toBe(modelMock);
    });
  });

  describe('getAccountWithSub()', () => {
    it('should return a new account if none is found', () => {
      // Given
      findOneMock.mockResolvedValueOnce(null);

      // When
      const result = service['getAccountWithSub'](interactionMock);

      // Then
      expect(result).toEqual(
        expect.objectContaining({
          sub: interactionMock.sub,
          idpIdentityKeys: [
            { idpSub: interactionMock.idpSub, idpUid: interactionMock.idpUid },
          ],
        }),
      );
    });

    it('should return an existing account if one is passed', () => {
      // When
      const result = service['getAccountWithSub'](interactionMock, accountMock);

      // Then
      expect(result).toBe(accountMock);
    });

    it('should return an account with updated last connection timestamp', () => {
      // When
      const result = service['getAccountWithSub'](interactionMock);

      // Then
      expect(result.lastConnection).toBe(interactionMock.lastConnection);
    });
  });
});
