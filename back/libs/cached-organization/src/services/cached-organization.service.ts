// import { findBySiretFactory } from '@proconnect-gouv/proconnect.entreprise/src/api/insee';
// import { getOrganizationInfoFactory } from '@proconnect-gouv/proconnect.identite/src/managers/organization';
import { isEmpty } from 'lodash';
import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ApiEntrepriseService } from '@fc/api-entreprise';

import { CachedOrganization } from '../schemas';

@Injectable()
export class CachedOrganizationService {
  constructor(
    private readonly apiEntrepriseService: ApiEntrepriseService,
    @InjectModel('CachedOrganization') private model: Model<CachedOrganization>,
  ) {}

  async getCachedOrganizationBySiret(siret: string) {
    console.log('Getting cached organization by SIRET...');
    const cachedOrganization = await this.model.findOne<CachedOrganization>({
      siret,
    });
    this.apiEntrepriseService.getOrganizationBySiret();
    if (!isEmpty(cachedOrganization)) {
      return cachedOrganization;
    }
  }

  async upsertWithSiret(cachedOrganization: CachedOrganization): Promise<void> {
    await this.model.findOneAndUpdate(
      {
        siret: cachedOrganization.siret,
      },
      cachedOrganization,
      { upsert: true },
    );
  }
}
