import { isEmpty } from 'lodash';
import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ApiEntrepriseService } from '@fc/api-entreprise';

import { CachedOrganization } from '../schemas';

@Injectable()
export class CachedOrganizationService {
  private readonly TTL_IN_MILLISECONDS = 24 * 60 * 60 * 1000; // 24h
  constructor(
    private readonly apiEntrepriseService: ApiEntrepriseService,
    @InjectModel('CachedOrganization') private model: Model<CachedOrganization>,
  ) {}

  async updateCachedOrganizationBySiretIfNeeded(siret: string) {
    const storedCachedOrganization =
      await this.model.findOne<CachedOrganization>({
        siret,
      });

    if (
      !isEmpty(storedCachedOrganization) &&
      storedCachedOrganization.updatedAt.getTime() + this.TTL_IN_MILLISECONDS >
        Date.now()
    ) {
      return;
    }

    const organizationInfo =
      await this.apiEntrepriseService.getOrganizationBySiret(siret);

    if (!isEmpty(storedCachedOrganization)) {
      return await this.model.updateOne(
        {
          siret,
        },
        {
          organizationInfo,
        },
      );
    }

    return await this.model.create({
      siret,
      organizationInfo,
    });
  }
}
