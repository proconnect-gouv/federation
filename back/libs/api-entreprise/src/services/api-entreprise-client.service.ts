import { ConfigService } from "@fc/config";
import mockData from "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret";
import { ApiEntrepriseConfig } from "../dto";

import { Injectable } from "@nestjs/common";
import { findBySiretFactory } from "@proconnect-gouv/proconnect.api_entreprise/api/insee";
import { createApiEntrepriseOpenApiClient } from "@proconnect-gouv/proconnect.api_entreprise/client";

@Injectable()
export class ApiEntrepriseClientService {
  constructor(private readonly configService: ConfigService) {}

  findBySiret(siret: string) {
    const { baseUrl, token, shouldMockApi, organizationSiret } =
      this.configService.get<ApiEntrepriseConfig>("ApiEntreprise");
    if (shouldMockApi) {
      const mockOrganization = Object.values(mockData).find(
        (org) => org.siret === siret,
      );
      return mockOrganization || { ...mockData.MaireClamart, siret };
    }
    const client = createApiEntrepriseOpenApiClient(token, {
      baseUrl,
    });
    return findBySiretFactory(client, {
      context: "ProConnect Fédération",
      object: "getOrganizationBySiret",
      recipient: organizationSiret,
    })(siret);
  }
}
