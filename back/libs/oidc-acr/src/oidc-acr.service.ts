import { get, intersection, isArray, isEmpty, isString } from "lodash";

import { Injectable } from "@nestjs/common";

import { ConfigService } from "@fc/config";
import { AppConfig, UserSession } from "@fc/core";
import { OidcProviderConfig } from "@fc/oidc-provider";

import { LoggerService } from "@fc/logger";
import { AcrClaims, ExtendedInteraction } from "./oidc-acr.type";

@Injectable()
export class OidcAcrService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  /**
   *  @returns the ACR for the current session, or undefined if the essential ACR requirement is not satisfied
   */
  getInteractionAcr({
    idpAcr,
    spEssentialAcr,
  }: Pick<UserSession, "idpAcr" | "spEssentialAcr">): string | undefined {
    if (
      !isEmpty(spEssentialAcr) &&
      !spEssentialAcr.split(" ").includes(idpAcr)
    ) {
      return undefined;
    }

    const {
      configuration: { acrValues: supportedAcrValues },
    } = this.config.get<OidcProviderConfig>("OidcProvider");

    if (!supportedAcrValues.includes(idpAcr)) {
      // If the IdP's ACR value is not supported, fallback to 'eidas1'
      // Note: Some IdPs, especially from Fonction Publique Territoriale, may use lower ACRs
      return "eidas1";
    }

    return idpAcr;
  }

  getFilteredAcrValues(
    requestedAcrValues: string[] | string | undefined,
  ): string[] {
    if (isEmpty(requestedAcrValues)) {
      return [];
    }

    let acrValuesAsArray: string[] = [];

    if (isString(requestedAcrValues)) {
      acrValuesAsArray = requestedAcrValues.split(" ");
    }

    if (isArray(requestedAcrValues)) {
      acrValuesAsArray = requestedAcrValues;
    }

    const {
      configuration: { acrValues: supportedAcrValues },
    } = this.config.get<OidcProviderConfig>("OidcProvider");

    return intersection(acrValuesAsArray, supportedAcrValues);
  }

  isEssentialAcrSatisfied({
    prompt,
  }: {
    prompt: ExtendedInteraction["prompt"];
  }): boolean {
    if (prompt.name === "login" && prompt.reasons.includes("essential_acr")) {
      return false;
    }

    if (prompt.name === "login" && prompt.reasons.includes("essential_acrs")) {
      return false;
    }

    return true;
  }

  getFilteredAcrParamsFromInteraction(
    { params, prompt }: ExtendedInteraction,
    idpId?: string,
  ): { acrClaims?: AcrClaims } {
    if (prompt.name === "login" && prompt.reasons.includes("essential_acr")) {
      return {
        acrClaims: {
          essential: true,
          value: this.getFilteredAcrValues(
            get(prompt.details, "acr.value"),
          ).join(" "),
        },
      };
    }

    if (prompt.name === "login" && prompt.reasons.includes("essential_acrs")) {
      return {
        acrClaims: {
          essential: true,
          values: this.getFilteredAcrValues(get(prompt.details, "acr.values")),
        },
      };
    }

    const defaultIdpId = this.config.get<AppConfig>("App").defaultIdpId;
    // this specific behavior is a legacy implementation and should be homogenized in the future
    if (idpId !== defaultIdpId) {
      return { acrClaims: { essential: true, value: "eidas1" } };
    }

    return {};
  }
}
