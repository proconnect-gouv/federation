import { isEmpty } from "lodash";
import { Model } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { computeServicePublicInfo } from "@proconnect-gouv/proconnect.identite/services/organization";
import { OrganizationInfo } from "@proconnect-gouv/proconnect.identite/types";

import { ApiEntrepriseConfig, ApiEntrepriseService } from "@fc/api-entreprise";
import { ConfigService } from "@fc/config";

import { LoggerService } from "@fc/logger";
import { ApiEntrepriseConnectionError } from "@proconnect-gouv/proconnect.api_entreprise/types";
import { CachedOrganization } from "../schemas";

@Injectable()
export class CachedOrganizationService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly apiEntrepriseService: ApiEntrepriseService,
    @InjectModel("CachedOrganization") private model: Model<CachedOrganization>,
  ) {}

  computeRoles(cachedOrganization: CachedOrganization): string[] {
    const roles: string[] = [];
    const servicePublicInfo = computeServicePublicInfo({
      cached_categorie_juridique: cachedOrganization.categorieJuridique,
      cached_etat_administratif: cachedOrganization.etatAdministratif,
      siret: cachedOrganization.siret,
    });

    if (servicePublicInfo.isServicePublic) {
      roles.push("agent_public");
    }
    if (!!servicePublicInfo.isCollectivite) {
      roles.push("agent_public_territorial");
    }
    if (!!servicePublicInfo.isAdministrationEtat) {
      roles.push("agent_public_etat");
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

    let organizationInfo: OrganizationInfo;

    try {
      organizationInfo =
        await this.apiEntrepriseService.getOrganizationBySiret(siret);
    } catch (error) {
      if (
        !isEmpty(storedCachedOrganization) &&
        error instanceof ApiEntrepriseConnectionError &&
        this.isFallbackCacheValid(storedCachedOrganization)
      ) {
        return storedCachedOrganization;
      }

      throw error;
    }

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

  private isFallbackCacheValid(cachedOrganization: CachedOrganization) {
    const { cacheTTLWhenApiEntrepriseIsDown } =
      this.configService.get<ApiEntrepriseConfig>("ApiEntreprise");
    return (
      Date.now() - cachedOrganization.updatedAt.getTime() <=
      cacheTTLWhenApiEntrepriseIsDown
    );
  }

  private isExpired(cachedOrganization: CachedOrganization) {
    const { cachedTTL } =
      this.configService.get<ApiEntrepriseConfig>("ApiEntreprise");
    return cachedOrganization.updatedAt.getTime() + cachedTTL < Date.now();
  }
}
