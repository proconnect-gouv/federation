import { v4 as uuid, Version4Options } from 'uuid';

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';

import { getLoggerMock } from '@mocks/logger';

import { CoreFcaAgentAccountBlockedException } from '../exceptions';
import { AccountFcaService } from './account-fca.service';

jest.mock('uuid');
type uuidType = (
  options?: Version4Options,
  buf?: undefined,
  offset?: number,
) => string;

describe('AccountFcaService', () => {
  let service: AccountFcaService;
  let configService: any;

  let modelMock: any;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue({ defaultIdpId: 'default-idp' }),
    };

    modelMock = jest.fn().mockImplementation((data) => ({
      ...data,
      active: true,
      idpIdentityKeys: [],
    }));
    modelMock.findOne = jest.fn();
    modelMock.findOneAndUpdate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
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
    })
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();

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
      jest.mocked<uuidType>(uuid).mockReturnValue(mockUuid);

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

      const result = await service.getOrCreateAccount(
        'uid',
        'sub',
        'email@fqdn',
      );

      expect(result).toEqual(existingAccount);
    });

    it('should check for an account with email and default IdP (pci) if no account found', async () => {
      // On the first call, no account with IdP uid and IdP sub
      modelMock.findOne.mockReturnValueOnce(null);
      modelMock.findOne.mockReturnValueOnce({
        active: true,
        sub: 'pci-sub',
        idpIdentityKeys: [],
      });

      const result = await service.getOrCreateAccount(
        'uid',
        'sub',
        'email@fqdn',
      );

      // First we looked for the exact account by sub and uid
      expect(modelMock.findOne.mock.calls[0][0]).toMatchObject({
        idpIdentityKeys: {
          $elemMatch: {
            idpSub: 'sub',
            idpUid: 'uid',
          },
        },
      });
      // We didn't find it and went looking for the email in PCI
      expect(modelMock.findOne.mock.calls[1][0]).toMatchObject({
        idpIdentityKeys: {
          $elemMatch: {
            idpMail: 'email@fqdn',
            idpUid: 'default-idp',
          },
        },
      });

      expect(result.sub).toBe('pci-sub');
    });

    it('should create a new account if none is found', async () => {
      const mockUuid = 'new-unique-id';
      jest.mocked<uuidType>(uuid).mockReturnValue(mockUuid);

      modelMock.findOne.mockResolvedValue(null);
      modelMock.findOneAndUpdate.mockResolvedValue({});

      const result = await service.getOrCreateAccount(
        'uid',
        'sub',
        'email@fqdn',
      );

      expect(result.sub).toBe(mockUuid);
      expect(result.idpIdentityKeys).toContainEqual({
        idpUid: 'uid',
        idpSub: 'sub',
        idpMail: 'email@fqdn',
      });
    });

    it('should throw an exception if the account is inactive', async () => {
      const inactiveAccount = {
        active: false,
        sub: '12345',
        idpIdentityKeys: [],
      };
      modelMock.findOne.mockResolvedValue(inactiveAccount);

      await expect(
        service.getOrCreateAccount('uid', 'sub', 'email@fqdn'),
      ).rejects.toThrow(CoreFcaAgentAccountBlockedException);
    });

    it('should push a new idpIdentityKey if not already present', async () => {
      const existingAccount = {
        sub: '12345',
        active: true,
        idpIdentityKeys: [
          {
            idpUid: 'existing-uid',
            idpSub: 'existing-sub',
            idpMail: 'email@other',
          },
        ],
      };

      modelMock.findOne.mockResolvedValue(existingAccount);
      modelMock.findOneAndUpdate.mockResolvedValue({});

      const result = await service.getOrCreateAccount(
        'new-uid',
        'new-sub',
        'email@fqdn',
      );

      expect(result.idpIdentityKeys).toEqual([
        {
          idpUid: 'existing-uid',
          idpSub: 'existing-sub',
          idpMail: 'email@other',
        },
        {
          idpUid: 'new-uid',
          idpSub: 'new-sub',
          idpMail: 'email@fqdn',
        },
      ]);
    });

    it('should update an idpIdentityKey with (uid,sub) with a different email', async () => {
      const existingAccount = {
        sub: '12345',
        active: true,
        idpIdentityKeys: [
          {
            idpUid: 'existing-uid',
            idpSub: 'existing-sub',
            idpMail: 'email@other',
          },
        ],
      };

      modelMock.findOne.mockResolvedValue(existingAccount);
      modelMock.findOneAndUpdate.mockResolvedValue({});

      const result = await service.getOrCreateAccount(
        'existing-uid',
        'existing-sub',
        'email@fqdn',
      );

      expect(result.idpIdentityKeys).toEqual([
        {
          idpUid: 'existing-uid',
          idpSub: 'existing-sub',
          idpMail: 'email@fqdn',
        },
      ]);
    });
  });
});
