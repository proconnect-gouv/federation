import { LoggerService } from "@fc/logger";
import { Injectable } from "@nestjs/common";
import { toOrganizationInfo } from "@proconnect-gouv/proconnect.identite/managers/organization";
import { ApiEntrepriseClientService } from "./api-entreprise-client.service";

@Injectable()
export class ApiEntrepriseService {
  constructor(
    private readonly apiEntrepriseClient: ApiEntrepriseClientService,
    private readonly logger: LoggerService,
  ) {}

  async getOrganizationBySiret(siret: string) {
    let establishment;
    try {
      establishment = await this.apiEntrepriseClient.findBySiret(siret);
    } catch (error) {
      this.logger.error({
        code: "api-entreprise-service-find-by-siret-error",
        apiEntrepriseFindError: error,
        apiEntrepriseFindErrorCause: (error as Error)?.cause,
        apiEntrepriseFindErrorType: (error as Error)?.constructor?.name,
      });
      throw error;
    }
    try {
      const organization = toOrganizationInfo(establishment);
      return organization;
    } catch (error) {
      this.logger.error({
        code: "api-entreprise-service-organization-mapping-error",
        apiEntrepriseMappingError: error,
        apiEntrepriseMappingErrorCause: (error as Error)?.cause,
        apiEntrepriseMappingErrorType: (error as Error)?.constructor?.name,
      });
      throw error;
    }
  }
}
