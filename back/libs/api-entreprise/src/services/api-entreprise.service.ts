import { Injectable } from "@nestjs/common";
import { toOrganizationInfo } from "@proconnect-gouv/proconnect.identite/managers/organization";
import { ApiEntrepriseClientProvider } from "./api-entreprise-client.provider";

@Injectable()
export class ApiEntrepriseService {
  constructor(
    private readonly apiEntrepriseClientProvider: ApiEntrepriseClientProvider,
  ) {}

  async getOrganizationBySiret(siret: string) {
    const establishment =
      await this.apiEntrepriseClientProvider.findBySiret(siret);
    return toOrganizationInfo(establishment);
  }
}
