import { LoggerService } from "#libs/logger";
import { Injectable } from "@nestjs/common";
import { toApiEntrepriseOrganizationInfo } from "@proconnect-gouv/proconnect.identite/managers/organization";
import { OrganizationInfo } from "@proconnect-gouv/proconnect.identite/types";
import { ApiEntrepriseClientService } from "./api-entreprise-client.service";

@Injectable()
export class ApiEntrepriseService {
  constructor(
    private readonly apiEntrepriseClient: ApiEntrepriseClientService,
    private readonly logger: LoggerService,
  ) {}

  async getOrganizationBySiret(siret: string): Promise<OrganizationInfo> {
    let establishment;
    try {
      establishment = await this.apiEntrepriseClient.findBySiret(siret);
    } catch (error) {
      this.logger.error({
        code: "api-entreprise-service-find-by-siret-error",
        apiEntrepriseFindError: error,
        apiEntrepriseFindErrorCause: error?.cause,
        apiEntrepriseFindErrorType: error?.constructor?.name,
      });
      throw error;
    }
    try {
      return {
        ...toApiEntrepriseOrganizationInfo(establishment),
        // federation never queries the RNE API
        denominationUsuelleEtablissementPrincipal: null,
      };
    } catch (error) {
      this.logger.error({
        code: "api-entreprise-service-organization-mapping-error",
        apiEntrepriseMappingError: error,
        apiEntrepriseMappingErrorCause: error?.cause,
        apiEntrepriseMappingErrorType: error?.constructor?.name,
      });
      throw error;
    }
  }
}
