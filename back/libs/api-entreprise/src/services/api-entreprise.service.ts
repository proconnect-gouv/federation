import { LoggerService } from "@fc/logger";
import { Inject, Injectable } from "@nestjs/common";
import { toOrganizationInfo } from "@proconnect-gouv/proconnect.identite/managers/organization";

@Injectable()
export class ApiEntrepriseService {
  constructor(
    @Inject("ApiEntrepriseClient")
    private readonly apiEntrepriseClient: {
      findBySiret: (siret: string) => Promise<any>;
    },
    private readonly loggerService: LoggerService,
  ) {}

  async getOrganizationBySiret(siret: string) {
    let establishment;
    try {
      establishment = await this.apiEntrepriseClient.findBySiret(siret);
    } catch (error) {
      this.loggerService.error({
        code: "api-entreprise-service-find-by-siret-error",
        originalError: error,
      });
      throw error;
    }
    try {
      const organization = toOrganizationInfo(establishment);
      return organization;
    } catch (error) {
      this.loggerService.error({
        code: "api-entreprise-service-organization-mapping-error",
        originalError: error,
      });
      throw error;
    }
  }
}
