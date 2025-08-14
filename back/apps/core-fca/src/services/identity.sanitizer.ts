import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { cloneDeep } from 'lodash';

import { HttpStatus, Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';

import { AppConfig, IdentityForSpDto, IdentityFromIdpDto } from '../dto';
import { CoreFcaInvalidIdentityException } from '../exceptions';

@Injectable()
export class IdentitySanitizer {
  constructor(
    private readonly logger: LoggerService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    private readonly config: ConfigService,
  ) {}

  async getValidatedIdentityFromIdp(
    plainIdentityFromIdp: any,
    idpId: string,
  ): Promise<IdentityFromIdpDto> {
    const identityFromIdp = plainToInstance(
      IdentityFromIdpDto,
      plainIdentityFromIdp,
    );
    const userinfoValidationErrors = await validate(identityFromIdp);
    const identityProvider = await this.identityProvider.getById(idpId);

    if (userinfoValidationErrors.length > 0) {
      this.logger.alert({
        msg: `Identity from "${idpId}" is invalid`,
        validationErrors: userinfoValidationErrors,
      });

      const contact =
        identityProvider.supportEmail ||
        this.config.get<AppConfig>('App').supportEmail;

      throw new CoreFcaInvalidIdentityException(
        contact,
        JSON.stringify(
          userinfoValidationErrors.map((error) => error?.constraints),
        ),
        JSON.stringify(userinfoValidationErrors[0]?.target), // same target for all validation errors
      );
    }

    return identityFromIdp;
  }

  // eslint-disable-next-line complexity
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
      groups: ['siret'],
    });

    if (siretValidationErrors.length > 0) {
      const identityProvider = await this.identityProvider.getById(idpId);
      identityForSp.siret = identityProvider.siret || null;
    }

    // Delete the phone_number property if validation fails
    const phoneNumberValidationErrors = await validate(identityForSp, {
      groups: ['phone_number'],
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
        !['aud', 'exp', 'iat', 'iss'].includes(key)
      ) {
        identityForSp.custom[key] = identityForSpWithExtraProperties[key];
      }
    });

    // Now the identity should be valid
    const identityValidationErrors = await validate(identityForSp);
    // The following may happen if the IdP has no default value
    // to substitute for an incorrect siret
    /* istanbul ignore next */
    if (identityValidationErrors.length > 0) {
      this.logger.alert({
        msg: 'transformIdentity final validation error',
        validationErrors: identityValidationErrors,
      });

      const identityProvider = await this.identityProvider.getById(idpId);

      const contact =
        identityProvider.supportEmail ||
        this.config.get<AppConfig>('App').supportEmail;

      const exception = new CoreFcaInvalidIdentityException(
        contact,
        JSON.stringify(
          identityValidationErrors.map((error) => error?.constraints),
        ),
        JSON.stringify(identityValidationErrors[0]?.target), // same target for all validation errors
      );

      exception.generic = true;
      // Because we've set the generic flag, we need to imitate the code
      // Which is preferable for consistency
      exception.error = 'Y500006';
      exception.error_description = identityFromIdp.siret
        ? 'siret incorrect'
        : 'siret manquant';
      exception.http_status_code = HttpStatus.INTERNAL_SERVER_ERROR;
      throw exception;
    }

    return identityForSp;
  }
}
