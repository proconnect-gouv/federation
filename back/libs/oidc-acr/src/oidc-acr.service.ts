import { get, intersection, isArray, isEmpty, isString } from "lodash";

import { Injectable } from "@nestjs/common";

import { ConfigService } from "@fc/config";
import { AppConfig, UserSession } from "@fc/core";
import { OidcProviderConfig } from "@fc/oidc-provider";

import { LoggerService } from "@fc/logger";
import { AcrClaims, AcrValues, ExtendedInteraction } from "./oidc-acr.type";

@Injectable()
export class OidcAcrService {
  acrEmailVerificationMapping = {
    eidas1: "eidas1-mfa",
    eidas0: "eidas0-mfa",
  };
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
    isEmailVerifiedByPcf,
    amr,
  }: Pick<
    UserSession,
    "idpAcr" | "spEssentialAcr" | "isEmailVerifiedByPcf" | "amr"
  >): string | undefined {
    const spEssentialAcrValues = spEssentialAcr?.split(" ") || [];
    const { supportedAcrValues } =
      this.config.get<OidcProviderConfig>("OidcProvider");
    let supportedIdpAcr = idpAcr;

    if (!Array.from(supportedAcrValues).includes(idpAcr)) {
      // If the IdP's ACR value is not supported, fallback to 'eidas1'
      // Note: Some IdPs, especially from Fonction Publique Territoriale, may use lower ACRs
      supportedIdpAcr = "eidas1";
    }

    if (
      isEmpty(spEssentialAcr) ||
      spEssentialAcrValues.includes(supportedIdpAcr)
    ) {
      return supportedIdpAcr;
    }

    if (amr?.includes("mail") || !isEmailVerifiedByPcf) {
      return undefined;
    }

    for (const [originalAcr, enrichedAcr] of Object.entries(
      this.acrEmailVerificationMapping,
    )) {
      if (
        spEssentialAcrValues.includes(enrichedAcr) &&
        supportedIdpAcr === originalAcr
      ) {
        return enrichedAcr;
      }
    }

    return undefined;
  }

  computeCanAcrBeSatisfiedByPcf({
    spEssentialAcr,
    amr,
  }: {
    spEssentialAcr?: string;
    amr?: string[];
  }) {
    const spEssentialAcrValues = spEssentialAcr?.split(" ") || [];
    if (amr?.includes("mail")) {
      return false;
    }
    return Object.values(this.acrEmailVerificationMapping).some((acr) =>
      spEssentialAcrValues.includes(acr),
    );
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

    const { supportedAcrValues } =
      this.config.get<OidcProviderConfig>("OidcProvider");

    return intersection(acrValuesAsArray, Array.from(supportedAcrValues));
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
  ): { acrValues?: AcrValues; acrClaims?: AcrClaims } {
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

    if (isString(params?.acr_values)) {
      this.logger.warn({
        code: "oidc-acr:acr_values_params_present",
        acrValues: params.acr_values,
        promptDetails: prompt.details,
      });
      return {
        acrValues: this.getFilteredAcrValues(params.acr_values).join(" "),
      };
    }

    const defaultIdpId = this.config.get<AppConfig>("App").defaultIdpId;
    // this specific behavior is a legacy implementation and should be homogenized in the future
    if (idpId !== defaultIdpId) {
      return { acrValues: "eidas1" };
    }

    return {};
  }
}
