import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { cloneDeep } from "lodash";

import { HttpStatus, Injectable } from "@nestjs/common";

import { ConfigService } from "@fc/config";
import { IdentityProviderAdapterMongoService } from "@fc/identity-provider-adapter-mongo";
import { LoggerService } from "@fc/logger";

import { ApiEntrepriseConfig } from "@fc/api-entreprise";
import { CachedOrganizationService } from "@fc/cached-organization";
import { IdentityProviderMetadata } from "@fc/oidc";
import { AppConfig, IdentityForSpDto, IdentityFromIdpDto } from "../dto";
import { CoreFcaInvalidIdentityException } from "../exceptions";

@Injectable()
export class IdentitySanitizer {
  constructor(
    private readonly logger: LoggerService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    private readonly config: ConfigService,
    private readonly cachedOrganizationService: CachedOrganizationService,
  ) {}

  async getValidatedIdentityFromIdp(
    plainIdentityFromIdp: any,
    idpId: string,
  ): Promise<IdentityFromIdpDto> {
    const identityFromIdp = plainToInstance(
      IdentityFromIdpDto,
      plainIdentityFromIdp,
    );
    await this.assertIdentityIsValid(
      identityFromIdp,
      idpId,
      HttpStatus.BAD_REQUEST,
    );

    return identityFromIdp;
  }

  async transformIdentity(
    identityFromIdp: IdentityFromIdpDto,
    idpId: string,
    sub: string,
    acr: string,
  ): Promise<IdentityForSpDto> {
    // Create a new instance of IdentityForSpDto
    const identityForSp = plainToInstance(
      IdentityForSpDto,
      cloneDeep(identityFromIdp),
    );

    // Replace invalid siret with the default siret value for the idp
    const siretValidationErrors = await validate(identityForSp, {
      groups: ["siret"],
    });

    if (siretValidationErrors.length > 0) {
      const identityProvider = await this.identityProvider.getById(idpId);
      if (!identityProvider.siret) {
        // it will throw an error as the siret is required in the IdentityForSpDto, and the error will be caught and logged in the controller
        this.throwExceptionForInvalidIdentity(
          identityProvider,
          identityForSp,
          siretValidationErrors,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      identityForSp.siret = identityProvider.siret;
    }

    const { featureFetchOrganizationData } =
      this.config.get<ApiEntrepriseConfig>("ApiEntreprise");

    if (featureFetchOrganizationData) {
      try {
        const cachedOrganization =
          await this.cachedOrganizationService.getCachedOrganizationBySiret(
            identityForSp.siret,
          );
        const roles =
          this.cachedOrganizationService.computeRoles(cachedOrganization);
        identityForSp.roles = roles;
      } catch (error) {
        this.logger.error({
          code: "identity-sanitizer-cached-organization-error",
          cachedOrganizationError: error,
          cachedOrganizationErrorCause: error?.cause,
          cachedOrganizationErrorType: error?.constructor?.name,
        });
        identityForSp.roles = [];
      }
    } else {
      // this happens only on the RIE
      identityForSp.roles = ["agent_public"];
    }

    // Delete the phone_number property if validation fails
    const phoneNumberValidationErrors = await validate(identityForSp, {
      groups: ["phone_number"],
    });

    if (phoneNumberValidationErrors.length > 0) {
      delete identityForSp.phone_number;
    }

    // The sub returned to the sp will be set by 'oidc-provider' lib and be set to the 'accountId' value
    identityForSp.sub = sub;

    // Add idp_id and idp_acr to the identity
    identityForSp.idp_id = idpId;
    identityForSp.idp_acr = acr;

    // Store any additional idp properties in a custom property for sp:
    // 1. Save the original identity
    const identityForSpWithExtraProperties = cloneDeep(identityForSp);

    // 2. Validate with "whitelist" to strip unknown properties
    await validate(identityForSp, { whitelist: true });

    // 3. Find and collect properties that were removed or are standard claims and add them to the custom property
    identityForSp.custom = {};
    Object.keys(identityForSpWithExtraProperties).forEach((key) => {
      if (
        !(key in identityForSp) &&
        !["aud", "exp", "iat", "iss"].includes(key)
      ) {
        identityForSp.custom[key] = identityForSpWithExtraProperties[key];
      }
    });

    // Now the identity should be valid
    await this.assertIdentityIsValid(
      identityForSp,
      idpId,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    return identityForSp;
  }

  private async assertIdentityIsValid(
    identity: object,
    idpId: string,
    httpStatus: HttpStatus,
  ) {
    const identityValidationErrors = await validate(identity);
    if (identityValidationErrors.length > 0) {
      const identityProvider = await this.identityProvider.getById(idpId);

      this.throwExceptionForInvalidIdentity(
        identityProvider,
        identity,
        identityValidationErrors,
        httpStatus,
      );
    }
  }

  private throwExceptionForInvalidIdentity(
    identityProvider: IdentityProviderMetadata,
    identity: object,
    identityValidationErrors: ValidationError[],
    httpStatus: HttpStatus,
  ) {
    this.logger.error({
      msg: `Identity from "${identityProvider.uid}" is invalid`,
      code: "invalid-identity-validation",
      validationErrors: identityValidationErrors,
    });

    this.logger.debug({
      code: "invalid-identity-debug",
      identity,
    });

    const contact =
      identityProvider.supportEmail ||
      this.config.get<AppConfig>("App").supportEmail;

    const exception = new CoreFcaInvalidIdentityException(
      identityValidationErrors.toString(),
      contact,
      JSON.stringify(
        identityValidationErrors.map((error) => error?.constraints),
      ),
      JSON.stringify(identityValidationErrors[0]?.target),
    );

    exception.http_status_code = httpStatus;
    throw exception;
  }
}
