/* eslint-disable @typescript-eslint/camelcase */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { SpManagementService } from './sp-management.service';
import { CryptographyService } from '@fc/cryptography';

describe('SpManagementService', () => {
  let spManagementservice: SpManagementService;
  const mockCryptographyService = {
    decryptSecretHash: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
  };

  const mockExec = jest.fn();

  const serviceProviderModel = getModelToken('SpManagement');

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptographyService,
        SpManagementService,
        {
          provide: serviceProviderModel,
          useValue: mockRepository,
        },
      ],
    })
      .overrideProvider(CryptographyService)
      .useValue(mockCryptographyService)
      .compile();

    spManagementservice = module.get<SpManagementService>(SpManagementService);

    mockExec.mockReturnValueOnce([
      {
        _doc: {
          key: '123',
          secret_hash: 'secret hash',
          redirect_uris: ['redirect_uris'],
        },
      },
    ]);
    mockRepository.find.mockReturnValueOnce({ exec: mockExec });
  });

  it('should be defined', () => {
    expect(spManagementservice).toBeDefined();
  });

  describe('findAllServiceProvider', () => {
    it('should resolve', async () => {
      // action
      const result = spManagementservice['findAllServiceProvider']();

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should have called find once', async () => {
      // action
      await spManagementservice['findAllServiceProvider']();

      // expect
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return result of type list', async () => {
      // action
      const result = await spManagementservice['findAllServiceProvider']();

      // expect
      expect(result).toStrictEqual([
        {
          key: '123',
          secret_hash: 'secret hash',
          redirect_uris: ['redirect_uris'],
        },
      ]);
    });
  });

  describe('getList', () => {
    it('should resolve', async () => {
      // action
      const result = spManagementservice.getList();

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should return result of type list', async () => {
      // action
      mockCryptographyService.decryptSecretHash.mockReturnValueOnce(
        'client_secret',
      );
      const result = await spManagementservice.getList();

      // expect
      expect(result).toStrictEqual([
        {
          client_id: '123',
          client_secret: 'client_secret',
          redirect_uris: ['redirect_uris'],
        },
      ]);
    });
  });
});
