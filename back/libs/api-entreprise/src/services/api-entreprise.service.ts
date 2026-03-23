import { Inject, Injectable } from "@nestjs/common";
import { toOrganizationInfo } from "@proconnect-gouv/proconnect.identite/managers/organization";

@Injectable()
export class ApiEntrepriseService {
  constructor(
    @Inject("ApiEntrepriseClient")
    private readonly apiEntrepriseClient: {
      findBySiret: (siret: string) => Promise<any>;
    },
  ) {}

  async getOrganizationBySiret(siret: string) {
    const establishment = await this.apiEntrepriseClient.findBySiret(siret);
    return toOrganizationInfo(establishment);
  }
}
