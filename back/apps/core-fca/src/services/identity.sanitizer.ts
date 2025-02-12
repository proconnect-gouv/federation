import { ClassTransformOptions } from 'class-transformer';
import { ValidatorOptions } from 'class-validator';

import { Injectable } from '@nestjs/common';

import { validateDto } from '@fc/common';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';

import { OidcIdentityDto } from '../dto';
import { CoreFcaInvalidIdentityException } from '../exceptions';
import { NoDefaultSiretException } from '../exceptions/no-default-idp-siret.exception';
import { IAgentIdentity } from '../interfaces';

@Injectable()
export class IdentitySanitizer {
  constructor(
    private readonly logger: LoggerService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
  ) {}

  async sanitize(
    identity: OidcIdentityDto,
    idpId: string,
  ): Promise<OidcIdentityDto> {
    const validatorOptions: ValidatorOptions = {
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      whitelist: true,
    };
    const transformOptions: ClassTransformOptions = {
      excludeExtraneousValues: true,
    };

    const errors = await validateDto(
      identity,
      OidcIdentityDto,
      validatorOptions,
      transformOptions,
    );

    if (errors.length === 0) {
      return identity;
    }

    return await this.handleErrors(errors, identity, idpId);
  }

  private async handleErrors(
    errors: any,
    identity: IAgentIdentity,
    idpId: string,
  ): Promise<IAgentIdentity> {
    this.logger.debug(errors, `Identity from "${idpId}" is invalid`);

    for (const error of errors) {
      /**
       * if there is an error in the phone number returned by idp
       * we simply remove the property from the identity
       * to avoid to display an empty string
       */
      if (error.property === 'phone_number') {
        delete identity.phone_number;
      } else if (error.property === 'siret') {
        /**
         * if there is an error with the siret returned by idp
         * we return the default siret from the current idp
         * ProConnect must always return a siret
         */
        identity.siret = await this.sanitizeSiret(error, idpId);
      } else {
        this.logger.err(error, `Identity from "${idpId}" is invalid`);
        throw new CoreFcaInvalidIdentityException();
      }
    }

    return identity;
  }

  private async sanitizeSiret(error: any, idpId: string): Promise<string> {
    const identityProvider = await this.identityProvider.getById(idpId);

    if (!identityProvider.siret) {
      this.logger.err(error, `No default siret for idp "${idpId}".`);
      throw new NoDefaultSiretException();
    }

    return identityProvider.siret;
  }
}
