import { isEmpty } from 'lodash';
import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ApiEntrepriseConfig, ApiEntrepriseService } from '@fc/api-entreprise';
import { ConfigService } from '@fc/config';

import { CachedOrganization } from '../schemas';

@Injectable()
export class CachedOrganizationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly apiEntrepriseService: ApiEntrepriseService,
    @InjectModel('CachedOrganization') private model: Model<CachedOrganization>,
  ) {}

  async upsertCachedOrganizationBySiretIfNeeded(siret: string) {
    const storedCachedOrganization =
      await this.model.findOne<CachedOrganization>({
        siret,
      });

    if (
      !isEmpty(storedCachedOrganization) &&
      !this.isExpired(storedCachedOrganization)
    ) {
      return storedCachedOrganization;
    }

    const organizationInfo =
      await this.apiEntrepriseService.getOrganizationBySiret(siret);

    if (!isEmpty(storedCachedOrganization)) {
      return await this.model.updateOne(
        {
          siret,
        },
        {
          ...organizationInfo,
        },
      );
    }

    return await this.model.create({
      ...organizationInfo,
    });
  }

  private isExpired(cachedOrganization: CachedOrganization) {
    const { cachedTTL } =
      this.configService.get<ApiEntrepriseConfig>('ApiEntreprise');
    return cachedOrganization.updatedAt.getTime() + cachedTTL < Date.now();
  }
}
