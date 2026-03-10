import { findBySiretFactory } from '@proconnect-gouv/proconnect.api_entreprise/api/insee';
import {
  ApiEntrepriseOpenApiClient,
  createApiEntrepriseOpenApiClient,
} from '@proconnect-gouv/proconnect.api_entreprise/client';
import mockData from '@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret';
import { toOrganizationInfo } from '@proconnect-gouv/proconnect.identite/managers/organization';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';

import { ApiEntrepriseConfig } from '../dto';

@Injectable()
export class ApiEntrepriseService {
  private client: ApiEntrepriseOpenApiClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const { baseUrl, token, shouldMockApi } =
      this.config.get<ApiEntrepriseConfig>('ApiEntreprise');

    if (shouldMockApi) {
      return;
    }

    this.client = createApiEntrepriseOpenApiClient(token, {
      baseUrl,
    });
  }

  async getOrganizationBySiret(siret: string) {
    const { shouldMockApi, organizationSiret } =
      this.config.get<ApiEntrepriseConfig>('ApiEntreprise');

    if (shouldMockApi) {
      return toOrganizationInfo(mockData.MaireClamart);
    }
    const establishment = await findBySiretFactory(this.client, {
      context: 'ProConnect Fédération',
      object: 'getOrganizationBySiret',
      recipient: organizationSiret,
    })(siret);

    return toOrganizationInfo(establishment);
  }
}
