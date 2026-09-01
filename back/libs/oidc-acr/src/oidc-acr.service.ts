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
    idpAmr,
  }: Pick<
    UserSession,
    "idpAcr" | "spEssentialAcr" | "isEmailVerifiedByPcf" | "idpAmr"
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

    if (idpAmr?.includes("mail") || !isEmailVerifiedByPcf) {
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

  getInteractionAmr({
    idpAmr,
    isEmailVerifiedByPcf,
  }: Pick<UserSession, "idpAmr" | "isEmailVerifiedByPcf">) {
    if (!idpAmr || isEmpty(idpAmr) || !isArray(idpAmr)) {
      return undefined;
    }

    if (isEmailVerifiedByPcf && !idpAmr.includes("mail")) {
      return [...idpAmr, "mail"];
    }

    return idpAmr;
  }

  computeCanAcrBeSatisfiedByPcf({
    spEssentialAcr,
    idpAmr,
    isOtpEmailEnabled,
  }: {
    spEssentialAcr?: string;
    idpAmr?: string[];
    isOtpEmailEnabled: boolean;
  }) {
    const spEssentialAcrValues = spEssentialAcr?.split(" ") || [];
    if (idpAmr?.includes("mail")) {
      return false;
    }
    if (!isOtpEmailEnabled) {
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

  isEssentialAcrSatisfied(
    interaction: ExtendedInteraction,
    userSession: Pick<
      UserSession,
      "idpAcr" | "isEmailVerifiedByPcf" | "idpAmr"
    >,
  ) {
    const areThereEssentialAcrRequested =
      this.computeAreThereEssentialAcrRequested(interaction);

    if (!areThereEssentialAcrRequested) {
      return true;
    }

    const { acrClaims } = this.getFilteredAcrParamsFromInteraction(interaction);
    const spEssentialAcr =
      acrClaims?.value || acrClaims?.values?.join(" ") || undefined;

    const interactionAcr = this.getInteractionAcr({
      idpAcr: userSession.idpAcr,
      spEssentialAcr,
      isEmailVerifiedByPcf: userSession.isEmailVerifiedByPcf,
      idpAmr: userSession.idpAmr,
    });

    if (!interactionAcr) {
      return false;
    }

    const { acrValuesThatRequireNewSession } =
      this.config.get<OidcProviderConfig>("OidcProvider");
    if (acrValuesThatRequireNewSession.includes(interactionAcr)) {
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

  private computeAreThereEssentialAcrRequested(interaction: {
    prompt: ExtendedInteraction["prompt"];
  }): boolean {
    const { prompt } = interaction;
    if (prompt.name !== "login") {
      return false;
    }

    const containsEssentialAcrs =
      prompt.reasons.includes("essential_acr") ||
      prompt.reasons.includes("essential_acrs");

    if (!containsEssentialAcrs) {
      return false;
    }

    return true;
  }
}
