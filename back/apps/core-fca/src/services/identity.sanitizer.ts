import { plainToInstance } from 'class-transformer';
import { isDefined, validate } from 'class-validator';
import { cloneDeep } from 'lodash';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { CoreConfig } from '@fc/core';
import { UnknownException } from '@fc/exceptions';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';

import { IdentityForSpDto, IdentityFromIdpDto } from '../dto';
import {
  CoreFcaInvalidIdentityException,
  NoDefaultSiretException,
} from '../exceptions';

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
      this.logger.err(
        userinfoValidationErrors,
        `Identity from "${idpId}" is invalid`,
      );

      const contact =
        identityProvider.supportEmail ||
        this.config.get<CoreConfig>('Core').supportEmail;

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
    // Defensive programming: this should never happen
    /* istanbul ignore next */
    if (identityValidationErrors.length > 0) {
      this.logger.err({ identityValidationErrors });
      throw new UnknownException();
    }

    if (!isDefined(identityForSp.siret)) {
      // We enforce siret to be set as we cannot do it with class-validator
      throw new NoDefaultSiretException();
    }

    return identityForSp;
  }
}
