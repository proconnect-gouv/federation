import mockData from '@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret';
import { toOrganizationInfo } from '@proconnect-gouv/proconnect.identite/managers/organization';
import createClient, { Client } from 'openapi-fetch';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';

import { ApiEntrepriseConfig } from '../dto';

@Injectable()
export class ApiEntrepriseService {
  private client: Client<any>;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    const { baseUrl, token, shouldMockApi } =
      this.config.get<ApiEntrepriseConfig>('ApiEntreprise');
    if (shouldMockApi) {
      return;
    }

    this.client = createClient({
      baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getOrganizationBySiret(siret: string) {
    const { shouldMockApi } =
      this.config.get<ApiEntrepriseConfig>('ApiEntreprise');

    if (shouldMockApi) {
      return toOrganizationInfo(mockData.MaireClamart);
    }
    const { data, error } = await this.client.GET(
      '/v3/insee/sirene/etablissements/{siret}',
      {
        params: {
          path: {
            siret,
          },
          query: {
            context: 'ProConnect Fédération',
            object: 'getOrganizationBySiret',
            recipient: '13002526500013',
          },
        },
      },
    );

    if (error) {
      this.logger.error(error);
      throw new Error(`Error fetching organization with SIRET ${siret}`);
    }

    const { data: establishment } = data;

    return toOrganizationInfo(establishment);
  }
}
