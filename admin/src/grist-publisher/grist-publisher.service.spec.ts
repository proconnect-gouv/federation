import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from 'nestjs-config';
import { GristPublisherService } from './grist-publisher.service';
import { LoggerService } from '../logger/logger.service';
import { identityProviderFactory } from '../identity-provider/fixtures';
import { serviceProviderFactory } from '../service-provider/fixtures';

describe('GristPublisherService', () => {
  let service: GristPublisherService;
  let configService: ConfigService;
  let loggerService: LoggerService;

  const baseMockGristConfig = {
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
            get: jest.fn().mockReturnValue(baseMockGristConfig),
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

    loggerService.info = jest.fn();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('publishIdentityProviders', () => {
    it('should add a new identity provider when it does not exist in Grist', async () => {
      const mockGristConfig = {
        ...baseMockGristConfig,
        gristIdentityProvidersTableId: 'identity-providers-table',
        gristNetworkName: 'test-network',
        gristEnvironmentName: 'test-env',
      };
      (configService.get as jest.Mock).mockReturnValue(mockGristConfig);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ records: [] }),
      });

      const identityProviders = [
        {
          uid: 'new-idp',
          title: 'New Identity Provider',
          active: true,
          discoveryUrl: 'https://example.com/.well-known',
          fqdns: ['example.com'],
          siret: '12345678901234',
          id_token_signed_response_alg: 'RS256' as const,
          userinfo_signed_response_alg: 'RS256' as const,
        },
      ].map(identityProviderFactory.createIdentityProviderFromDb);

      await service.publishIdentityProviders(identityProviders);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      const upsertCall = (global.fetch as jest.Mock).mock.calls[1];
      const upsertBody = JSON.parse(upsertCall[1].body);
      expect(upsertBody.records).toHaveLength(1);
      expect(upsertBody.records[0].fields.UID).toBe('new-idp');
    });

    it('should delete an identity provider when it no longer exists locally', async () => {
      const mockGristConfig = {
        ...baseMockGristConfig,
        gristIdentityProvidersTableId: 'identity-providers-table',
        gristNetworkName: 'test-network',
        gristEnvironmentName: 'test-env',
      };
      (configService.get as jest.Mock).mockReturnValue(mockGristConfig);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          records: [
            {
              id: 123,
              fields: {
                UID: 'old-idp',
                Reseau: 'test-network',
                Environnement: 'test-env',
                Titre: 'Old Provider',
              },
            },
          ],
        }),
      });

      await service.publishIdentityProviders([]);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      const deleteCall = (global.fetch as jest.Mock).mock.calls[1];
      expect(deleteCall[0]).toContain('/records/delete');
      const deleteBody = JSON.parse(deleteCall[1].body);
      expect(deleteBody).toEqual([123]);
    });

    it('should update an identity provider when fields have changed', async () => {
      const mockGristConfig = {
        ...baseMockGristConfig,
        gristIdentityProvidersTableId: 'identity-providers-table',
        gristNetworkName: 'test-network',
        gristEnvironmentName: 'test-env',
      };
      (configService.get as jest.Mock).mockReturnValue(mockGristConfig);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          records: [
            {
              id: 456,
              fields: {
                UID: 'existing-idp',
                Reseau: 'test-network',
                Environnement: 'test-env',
                Titre: 'Old Title',
                Actif: 'Oui',
              },
            },
          ],
        }),
      });

      const identityProviders = [
        {
          uid: 'existing-idp',
          title: 'Updated Title',
          active: true,
          discoveryUrl: 'https://example.com/.well-known',
          fqdns: ['example.com'],
          siret: '12345678901234',
          id_token_signed_response_alg: 'RS256' as const,
          userinfo_signed_response_alg: 'RS256' as const,
        },
      ].map(identityProviderFactory.createIdentityProviderFromDb);

      await service.publishIdentityProviders(identityProviders);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      const upsertCall = (global.fetch as jest.Mock).mock.calls[1];
      const upsertBody = JSON.parse(upsertCall[1].body);
      expect(upsertBody.records).toHaveLength(1);
      expect(upsertBody.records[0].fields.Titre).toBe('Updated Title');
    });
  });

  describe('publishServiceProviders', () => {
    it('should add a new service provider when it does not exist in Grist', async () => {
      const mockGristConfig = {
        ...baseMockGristConfig,
        gristServiceProvidersTableId: 'service-providers-table',
        gristNetworkName: 'test-network',
        gristEnvironmentName: 'test-env',
      };
      (configService.get as jest.Mock).mockReturnValue(mockGristConfig);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ records: [] }),
      });

      const serviceProviders = [
        {
          key: 'new-sp',
          name: 'New Service Provider',
          active: true,
          redirect_uris: ['https://example.com'],
        },
      ].map(serviceProviderFactory.createServiceProviderFromDb);

      await service.publishServiceProviders(serviceProviders);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      const upsertCall = (global.fetch as jest.Mock).mock.calls[1];
      const upsertBody = JSON.parse(upsertCall[1].body);
      expect(upsertBody.records).toHaveLength(1);
      expect(upsertBody.records[0].fields.UID).toBe('new-sp');
    });

    it('should delete a service provider when it no longer exists locally', async () => {
      const mockGristConfig = {
        ...baseMockGristConfig,
        gristServiceProvidersTableId: 'service-providers-table',
        gristNetworkName: 'test-network',
        gristEnvironmentName: 'test-env',
      };
      (configService.get as jest.Mock).mockReturnValue(mockGristConfig);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          records: [
            {
              id: 123,
              fields: {
                UID: 'old-sp',
                Reseau: 'test-network',
                Environnement: 'test-env',
                Nom: 'Old Provider',
              },
            },
          ],
        }),
      });

      await service.publishServiceProviders([]);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      const deleteCall = (global.fetch as jest.Mock).mock.calls[1];
      expect(deleteCall[0]).toContain('/records/delete');
      const deleteBody = JSON.parse(deleteCall[1].body);
      expect(deleteBody).toEqual([123]);
    });

    it('should update a service provider when fields have changed', async () => {
      const mockGristConfig = {
        ...baseMockGristConfig,
        gristServiceProvidersTableId: 'service-providers-table',
        gristNetworkName: 'test-network',
        gristEnvironmentName: 'test-env',
      };
      (configService.get as jest.Mock).mockReturnValue(mockGristConfig);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          records: [
            {
              id: 456,
              fields: {
                UID: 'existing-sp',
                Reseau: 'test-network',
                Environnement: 'test-env',
                Nom: 'Old Title',
                Actif: 'Oui',
                Liste_des_URL_de_callback: 'https://example.com',
              },
            },
          ],
        }),
      });

      const serviceProviders = [
        {
          key: 'existing-sp',
          name: 'Updated Title',
          active: true,
          redirect_uris: ['https://example.com'],
        },
      ].map(serviceProviderFactory.createServiceProviderFromDb);

      await service.publishServiceProviders(serviceProviders);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      const upsertCall = (global.fetch as jest.Mock).mock.calls[1];
      const upsertBody = JSON.parse(upsertCall[1].body);
      expect(upsertBody.records).toHaveLength(1);
      expect(upsertBody.records[0].fields.Nom).toBe('Updated Title');
    });
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
