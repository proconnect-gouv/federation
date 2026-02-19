import { Model } from 'mongoose';

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { ApiEntrepriseService } from '@fc/api-entreprise';

import { CachedOrganization } from '../schemas';
import { CachedOrganizationService } from './cached-organization.service';

describe('CachedOrganizationService', () => {
  let service: CachedOrganizationService;
  let model: Model<CachedOrganization>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CachedOrganizationService,
        {
          provide: ApiEntrepriseService,
          useValue: {
            getOrganizationBySiret: jest.fn(),
          },
        },
        {
          provide: getModelToken('CachedOrganization'),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CachedOrganizationService>(CachedOrganizationService);
    model = module.get<Model<CachedOrganization>>(
      getModelToken('CachedOrganization'),
    );
  });

  describe('getCachedOrganizationBySiret', () => {
    it('should return cached organization if found', async () => {
      const siret = '12345678901234';
      const cachedOrg = { siret, organizationInfo: {} };
      (model.findOne as jest.Mock).mockResolvedValue(cachedOrg);

      await service.getCachedOrganizationBySiret(siret);

      expect(model.create).not.toHaveBeenCalled();
    });

    it('should fetch from api and create if not found in cache', async () => {
      const siret = '12345678901234';
      (model.findOne as jest.Mock).mockResolvedValue(undefined);

      await service.getCachedOrganizationBySiret(siret);

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({ siret }),
      );
    });
  });
});
