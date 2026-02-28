import { Model } from 'mongoose';

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { ApiEntrepriseService } from '@fc/api-entreprise';
import { ConfigService } from '@fc/config';

import { CachedOrganization } from '../schemas';
import { CachedOrganizationService } from './cached-organization.service';

describe('CachedOrganizationService', () => {
  let service: CachedOrganizationService;
  let model: Model<CachedOrganization>;
  const apiEntrepriseService = {
    getOrganizationBySiret: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CachedOrganizationService,
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: ApiEntrepriseService,
          useValue: apiEntrepriseService,
        },
        {
          provide: getModelToken('CachedOrganization'),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            updateOne: jest.fn(),
          },
        },
      ],
    }).compile();

    configService.get.mockReturnValue({ cachedTTL: 24 * 60 * 60 * 1000 }); // 24 hours TTL

    service = module.get<CachedOrganizationService>(CachedOrganizationService);
    model = module.get<Model<CachedOrganization>>(
      getModelToken('CachedOrganization'),
    );
  });

  it('should return early if cached organization exists and TTL is not expired', async () => {
    const siret = '12345678901234';
    const now = Date.now();
    const storedOrganization = {
      siret,
      organizationInfo: { name: 'Test Org' },
      updatedAt: new Date(now - 60 * 60 * 1000), // 1 hour ago
    };

    jest.spyOn(model, 'findOne').mockResolvedValue(storedOrganization);

    await service.upsertCachedOrganizationBySiretIfNeeded(siret);

    expect(model.findOne).toHaveBeenCalledWith({ siret });
    expect(model.create).not.toHaveBeenCalled();
  });

  it('should fetch and create new organization if no cached data exists', async () => {
    const siret = '12345678901234';
    const organizationInfo = { name: 'New Org', siren: '1234567890', siret };

    jest.spyOn(model, 'findOne').mockResolvedValue(null);
    jest
      .spyOn(apiEntrepriseService, 'getOrganizationBySiret')
      .mockResolvedValue(organizationInfo);
    jest.spyOn(model, 'create').mockResolvedValue({} as any);

    await service.upsertCachedOrganizationBySiretIfNeeded(siret);

    expect(model.findOne).toHaveBeenCalledWith({ siret });
    expect(apiEntrepriseService.getOrganizationBySiret).toHaveBeenCalledWith(
      siret,
    );
    expect(model.create).toHaveBeenCalledWith({ ...organizationInfo });
  });

  it('should update organization if cached data exists but TTL is expired', async () => {
    const siret = '12345678901234';
    const organizationInfo = { name: 'Updated Org' };
    const expiredDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
    jest
      .spyOn(model, 'findOne')
      .mockResolvedValue({ siret, updatedAt: expiredDate });
    jest
      .spyOn(apiEntrepriseService, 'getOrganizationBySiret')
      .mockResolvedValue(organizationInfo);
    jest.spyOn(model, 'updateOne').mockResolvedValue({} as any);

    await service.upsertCachedOrganizationBySiretIfNeeded(siret);

    expect(model.updateOne).toHaveBeenCalledWith(
      { siret },
      { ...organizationInfo },
    );
  });
});
