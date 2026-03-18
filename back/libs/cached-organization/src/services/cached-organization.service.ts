import { isEmpty } from "lodash";
import { Model } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isPublicService } from "@proconnect-gouv/proconnect.identite/services/organization";

import { ApiEntrepriseConfig, ApiEntrepriseService } from "@fc/api-entreprise";
import { ConfigService } from "@fc/config";

import { CachedOrganization } from "../schemas";

@Injectable()
export class CachedOrganizationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly apiEntrepriseService: ApiEntrepriseService,
    @InjectModel("CachedOrganization") private model: Model<CachedOrganization>,
  ) {}

  computeRoles(cachedOrganization: CachedOrganization): string[] {
    const roles: string[] = [];
    const isServicePublic = isPublicService({
      cached_categorie_juridique: cachedOrganization.categorieJuridique,
      cached_etat_administratif: cachedOrganization.etatAdministratif,
      siret: cachedOrganization.siret,
    });

    if (isServicePublic) {
      roles.push("agent_public");
    }

    return roles;
  }

  async getCachedOrganizationBySiret(
    siret: string,
  ): Promise<CachedOrganization> {
    const storedCachedOrganization =
      await this.model.findOne<CachedOrganization>({
        siret,
      });

    if (
      !isEmpty(storedCachedOrganization) &&
      !this.isExpired(storedCachedOrganization)
    ) {
      return storedCachedOrganization;
    }

    const organizationInfo =
      await this.apiEntrepriseService.getOrganizationBySiret(siret);

    const updatedCachedOrganization = await this.model.findOneAndUpdate(
      {
        siret,
      },
      {
        $set: {
          ...organizationInfo,
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    return updatedCachedOrganization;
  }

  private isExpired(cachedOrganization: CachedOrganization) {
    const { cachedTTL } =
      this.configService.get<ApiEntrepriseConfig>("ApiEntreprise");
    return cachedOrganization.updatedAt.getTime() + cachedTTL < Date.now();
  }
}
