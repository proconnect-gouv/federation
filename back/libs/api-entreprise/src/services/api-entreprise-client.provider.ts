import { ConfigService } from "@fc/config";
import mockData from "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-insee-sirene-etablissements-siret";
import { ApiEntrepriseConfig } from "../dto";

import { findBySiretFactory } from "@proconnect-gouv/proconnect.api_entreprise/api/insee";
import { createApiEntrepriseOpenApiClient } from "@proconnect-gouv/proconnect.api_entreprise/client";

const ApiEntrepriseClientProvider = {
  provide: "ApiEntrepriseClient",
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const { baseUrl, token, shouldMockApi, organizationSiret } =
      configService.get<ApiEntrepriseConfig>("ApiEntreprise");
    if (shouldMockApi) {
      return {
        findBySiret: async (siret: string) => {
          const mockOrganization = Object.values(mockData).find(
            (org) => org.siret === siret,
          );
          return mockOrganization || { ...mockData.MaireClamart, siret };
        },
      };
    }
    const client = createApiEntrepriseOpenApiClient(token, {
      baseUrl,
    });
    return {
      findBySiret: findBySiretFactory(client, {
        context: "ProConnect Fédération",
        object: "getOrganizationBySiret",
        recipient: organizationSiret,
      }),
    };
  },
};

export { ApiEntrepriseClientProvider };
