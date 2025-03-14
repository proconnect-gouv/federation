import { ValidationError } from 'class-validator';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { IdentityProviderMetadata } from '@fc/oidc';

import { IdentityForSpDto, IdentityFromIdpDto } from '../dto';
import { CoreFcaInvalidIdentityException } from '../exceptions';
import { NoDefaultSiretException } from '../exceptions/no-default-idp-siret.exception';

@Injectable()
export class IdentitySanitizer {
  constructor(
    private readonly logger: LoggerService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    private readonly config: ConfigService,
  ) {}

  // todo: move the sanitizer into a dedicated lib identity-sanitizer
  async sanitize(
    identity: IdentityFromIdpDto,
    idpId: string,
    errors: ValidationError[],
  ): Promise<IdentityForSpDto> {
    const PHONE_NUMBER_SANITIZER_PROPERTY = 'phone_number';
    const SIRET_SANITIZER_PROPERTY = 'siret';

    this.logger.debug(errors, `Identity from "${idpId}" is invalid`);

    const identityProvider = await this.identityProvider.getById(idpId);
    let sanitizedIdentity = { ...identity };

    const filteredErrors = errors
      .map((error) => {
        if (error.property === PHONE_NUMBER_SANITIZER_PROPERTY) {
          sanitizedIdentity = this.sanitizePhoneNumber(identity);
        } else if (error.property === SIRET_SANITIZER_PROPERTY) {
          /**
           * if there is an error with the siret returned by idp
           * we return the default siret from the current idp
           * ProConnect always return a siret
           */
          sanitizedIdentity.siret = this.sanitizeSiret(identityProvider);
        } else {
          return error;
        }
      })
      .filter((error) => error);

    if (filteredErrors.length > 0) {
      this.logger.err(filteredErrors, `Identity from "${idpId}" is invalid`);
      const contact =
        identityProvider.supportEmail ||
        this.config.get('customerServiceEmail');
      throw new CoreFcaInvalidIdentityException(
        contact,
        JSON.stringify(filteredErrors.map((error) => error?.constraints)),
        JSON.stringify(filteredErrors[0]?.target), // same target for all validation errors
      );
    }

    return sanitizedIdentity as IdentityForSpDto;
  }

  private sanitizePhoneNumber(
    identity: IdentityFromIdpDto,
  ): IdentityFromIdpDto {
    delete identity.phone_number;
    return identity;
  }

  private sanitizeSiret(identityProvider: IdentityProviderMetadata): string {
    if (!identityProvider.siret) {
      this.logger.err(`No default siret for idp "${identityProvider.uid}".`);
      throw new NoDefaultSiretException();
    }

    return identityProvider.siret;
  }
}
