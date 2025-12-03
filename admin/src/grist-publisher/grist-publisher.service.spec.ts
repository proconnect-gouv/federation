import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from 'nestjs-config';
import { GristPublisherService } from './grist-publisher.service';
import { LoggerService } from '../logger/logger.service';

describe('GristPublisherService', () => {
  let service: GristPublisherService;
  let configService: ConfigService;
  let loggerService: LoggerService;

  const mockGristConfig = {
    gristDomain: 'test.grist.com',
    gristDocId: 'test-doc-id',
    gristApiKey: 'test-api-key',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GristPublisherService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockGristConfig),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GristPublisherService>(GristPublisherService);
    configService = module.get<ConfigService>(ConfigService);
    loggerService = module.get<LoggerService>(LoggerService);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('computeRecordUpdates', () => {
    it('should return empty arrays when nothing has changed', () => {
      const previousRecords = [
        {
          id: 1,
          fields: {
            UID: 'uid-1',
            Reseau: 'test-network',
            Environnement: 'test-env',
            Titre: 'Provider 1',
          },
        },
      ];
      const nextRecords = [
        {
          UID: 'uid-1',
          Reseau: 'test-network',
          Environnement: 'test-env',
          Titre: 'Provider 1',
        },
      ];

      const result = service['computeRecordUpdates'](
        previousRecords,
        nextRecords,
      );

      expect(result.recordIdsToDelete).toEqual([]);
      expect(result.recordsToUpsert).toEqual([]);
    });

    it('should add new provider when it does not exist in previous records', () => {
      const previousRecords = [
        {
          id: 1,
          fields: {
            UID: 'uid-1',
            Reseau: 'test-network',
            Environnement: 'test-env',
            Titre: 'Provider 1',
          },
        },
      ];
      const nextRecords = [
        {
          UID: 'uid-1',
          Reseau: 'test-network',
          Environnement: 'test-env',
          Titre: 'Provider 1',
        },
        {
          UID: 'uid-2',
          Reseau: 'test-network',
          Environnement: 'test-env',
          Titre: 'Provider 2',
        },
      ];

      const result = service['computeRecordUpdates'](
        previousRecords,
        nextRecords,
      );

      expect(result.recordIdsToDelete).toEqual([]);
      expect(result.recordsToUpsert).toEqual([nextRecords[1]]);
    });

    it('should update provider when fields have changed', () => {
      const previousRecords = [
        {
          id: 1,
          fields: {
            UID: 'uid-1',
            Reseau: 'test-network',
            Environnement: 'test-env',
            Titre: 'Provider 1',
          },
        },
      ];
      const nextRecords = [
        {
          UID: 'uid-1',
          Reseau: 'test-network',
          Environnement: 'test-env',
          Titre: 'Provider 1 Updated',
        },
      ];

      const result = service['computeRecordUpdates'](
        previousRecords,
        nextRecords,
      );

      expect(result.recordIdsToDelete).toEqual([]);
      expect(result.recordsToUpsert).toEqual([nextRecords[0]]);
    });

    it('should delete provider when it no longer exists in next records', () => {
      const previousRecords = [
        {
          id: 1,
          fields: {
            UID: 'uid-1',
            Reseau: 'test-network',
            Environnement: 'test-env',
            Titre: 'Provider 1',
          },
        },
        {
          id: 2,
          fields: {
            UID: 'uid-2',
            Reseau: 'test-network',
            Environnement: 'test-env',
            Titre: 'Provider 2',
          },
        },
      ];
      const nextRecords = [
        {
          UID: 'uid-1',
          Reseau: 'test-network',
          Environnement: 'test-env',
          Titre: 'Provider 1',
        },
      ];

      const result = service['computeRecordUpdates'](
        previousRecords,
        nextRecords,
      );

      expect(result.recordIdsToDelete).toEqual([2]);
      expect(result.recordsToUpsert).toEqual([]);
    });
  });

  describe('upsertGristRecords', () => {
    it('should not slice records when count is below threshold (100)', async () => {
      const records = Array.from({ length: 50 }, (_, i) => ({
        UID: `uid-${i}`,
        Reseau: 'test-network',
        Environnement: 'test-env',
      }));

      await service['upsertGristRecords'](records, 'test-table-id');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should slice records when count exceeds threshold (100)', async () => {
      const records = Array.from({ length: 250 }, (_, i) => ({
        UID: `uid-${i}`,
        Reseau: 'test-network',
        Environnement: 'test-env',
      }));

      await service['upsertGristRecords'](records, 'test-table-id');

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should slice records into correct chunk sizes', async () => {
      const records = Array.from({ length: 250 }, (_, i) => ({
        UID: `uid-${i}`,
        Reseau: 'test-network',
        Environnement: 'test-env',
      }));

      await service['upsertGristRecords'](records, 'test-table-id');

      const calls = (global.fetch as jest.Mock).mock.calls;
      const firstCallBody = JSON.parse(calls[0][1].body);
      const secondCallBody = JSON.parse(calls[1][1].body);
      const thirdCallBody = JSON.parse(calls[2][1].body);

      expect(firstCallBody.records).toHaveLength(100);
      expect(secondCallBody.records).toHaveLength(100);
      expect(thirdCallBody.records).toHaveLength(50);
    });
  });
});
