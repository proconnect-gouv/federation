import { findBySiretFactory } from '@proconnect-gouv/proconnect.api_entreprise/api/insee';
import { toOrganizationInfo } from '@proconnect-gouv/proconnect.identite/managers/organization';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';

import { ApiEntrepriseService } from './api-entreprise.service';

jest.mock('@proconnect-gouv/proconnect.api_entreprise/api/insee', () => ({
  findBySiretFactory: jest.fn(),
}));
jest.mock('@proconnect-gouv/proconnect.identite/managers/organization', () => ({
  toOrganizationInfo: jest.fn(),
}));
jest.mock(
  '@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret',
  () => ({ MaireClamart: {} }),
);

describe('ApiEntrepriseService', () => {
  let service: ApiEntrepriseService;
  const configService = {
    get: jest.fn(),
  };
  const loggerService = {
    error: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiEntrepriseService,
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: LoggerService,
          useValue: loggerService,
        },
      ],
    }).compile();

    service = module.get<ApiEntrepriseService>(ApiEntrepriseService);
  });

  describe('onModuleInit', () => {
    beforeEach(() => {});
    it('should return early if shouldMockApi is true', () => {
      configService.get.mockReturnValue({ shouldMockApi: true });

      service.onModuleInit();

      expect(service['client']).toBeUndefined();
    });

    it('should create client with baseUrl and token if shouldMockApi is false', () => {
      const config = {
        baseUrl: 'https://api.example.com',
        token: 'test-token',
        shouldMockApi: false,
      };
      configService.get.mockReturnValue(config);

      service.onModuleInit();

      expect(service['client']).toBeDefined();
    });
  });

  describe('getOrganizationBySiret', () => {
    it('should return mock data if shouldMockApi is true', async () => {
      const siret = '12345678901234';
      configService.get.mockReturnValue({ shouldMockApi: true });
      const mockOrganizationInfo = { name: 'Test Org' };
      (toOrganizationInfo as jest.Mock).mockReturnValue(mockOrganizationInfo);

      const result = await service.getOrganizationBySiret(siret);

      expect(result).toEqual(mockOrganizationInfo);
      expect(toOrganizationInfo).toHaveBeenCalledWith({});
    });

    it('should fetch organization from API if shouldMockApi is false', async () => {
      const siret = '12345678901234';
      const establishment = { siret, name: 'Test Company' };
      const organizationInfo = { name: 'Test Company' };

      configService.get.mockReturnValue({
        shouldMockApi: false,
        organizationSiret: '13002526500013',
      });
      (findBySiretFactory as jest.Mock).mockReturnValue(
        jest.fn().mockResolvedValue(establishment),
      );

      (toOrganizationInfo as jest.Mock).mockReturnValue(organizationInfo);

      const result = await service.getOrganizationBySiret(siret);

      expect(toOrganizationInfo).toHaveBeenCalledWith(establishment);
      expect(result).toEqual(organizationInfo);
    });
  });
});
