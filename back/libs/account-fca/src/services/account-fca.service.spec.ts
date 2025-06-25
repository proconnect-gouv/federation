import { v4 as uuid } from 'uuid';

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@fc/logger';

import { getLoggerMock } from '@mocks/logger';

import { CoreFcaAgentAccountBlockedException } from '../exceptions';
import { AccountFcaService } from './account-fca.service';

jest.mock('uuid');

describe('AccountFcaService', () => {
  let service: AccountFcaService;

  let modelMock: any;

  beforeEach(async () => {
    modelMock = jest.fn().mockImplementation((data) => ({
      ...data,
      active: true,
      idpIdentityKeys: [],
    }));
    modelMock.findOne = jest.fn();
    modelMock.findOneAndUpdate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountFcaService,
        {
          provide: getModelToken('AccountFca'),
          useValue: modelMock,
        },
        {
          provide: LoggerService,
          useValue: getLoggerMock(),
        },
      ],
    }).compile();

    service = module.get<AccountFcaService>(AccountFcaService);
  });

  describe('getAccountByIdpAgentKeys', () => {
    it('should return an account when one is found with matching idpIdentityKeys', async () => {
      const mockAccount = { idpIdentityKeys: { idpSub: 'sub', idpUid: 'uid' } };
      modelMock.findOne.mockResolvedValue(mockAccount);

      const result = await service.getAccountByIdpAgentKeys({
        idpSub: 'sub',
        idpUid: 'uid',
      });

      expect(modelMock.findOne).toHaveBeenCalledWith({
        idpIdentityKeys: {
          $elemMatch: {
            idpSub: 'sub',
            idpUid: 'uid',
          },
        },
      });
      expect(result).toEqual(mockAccount);
    });

    it('should return null if no account is found', async () => {
      modelMock.findOne.mockResolvedValue(null);

      const result = await service.getAccountByIdpAgentKeys({
        idpSub: 'sub',
        idpUid: 'uid',
      });

      expect(result).toBeNull();
    });
  });

  describe('createAccount', () => {
    it('should create a new account with a unique sub', () => {
      const mockUuid = '12345-unique-id';
      jest.mocked(uuid).mockReturnValue(mockUuid);

      const account = service.createAccount();

      expect(account.sub).toBe(mockUuid);
      expect(account).toBeDefined();
    });
  });

  describe('upsertWithSub', () => {
    it('should call findOneAndUpdate with upsert option', async () => {
      const account = { sub: '12345' } as any;
      modelMock.findOneAndUpdate.mockResolvedValue(account);

      await service.upsertWithSub(account);

      expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { sub: account.sub },
        account,
        { upsert: true },
      );
    });
  });

  describe('getOrCreateAccount', () => {
    it('should return an existing account if found', async () => {
      const existingAccount = {
        sub: '12345',
        active: true,
        idpIdentityKeys: [],
      };
      modelMock.findOne.mockResolvedValue(existingAccount);

      const result = await service.getOrCreateAccount('uid', 'sub');

      expect(result).toEqual(existingAccount);
    });

    it('should create a new account if none is found', async () => {
      const mockUuid = 'new-unique-id';
      jest.mocked(uuid).mockReturnValue(mockUuid);

      modelMock.findOne.mockResolvedValue(null);
      modelMock.findOneAndUpdate.mockResolvedValue({});

      const result = await service.getOrCreateAccount('uid', 'sub');

      expect(result.sub).toBe(mockUuid);
      expect(result.idpIdentityKeys).toContainEqual({
        idpUid: 'uid',
        idpSub: 'sub',
      });
    });

    it('should throw an exception if the account is inactive', async () => {
      const inactiveAccount = {
        active: false,
        sub: '12345',
        idpIdentityKeys: [],
      };
      modelMock.findOne.mockResolvedValue(inactiveAccount);

      await expect(service.getOrCreateAccount('uid', 'sub')).rejects.toThrow(
        CoreFcaAgentAccountBlockedException,
      );
    });

    it('should push a new idpIdentityKey if not already present', async () => {
      const existingAccount = {
        sub: '12345',
        active: true,
        idpIdentityKeys: [{ idpUid: 'existing-uid', idpSub: 'existing-sub' }],
      };

      modelMock.findOne.mockResolvedValue(existingAccount);
      modelMock.findOneAndUpdate.mockResolvedValue({});

      const result = await service.getOrCreateAccount('new-uid', 'new-sub');

      expect(result.idpIdentityKeys).toContainEqual({
        idpUid: 'new-uid',
        idpSub: 'new-sub',
      });
    });
  });
});
