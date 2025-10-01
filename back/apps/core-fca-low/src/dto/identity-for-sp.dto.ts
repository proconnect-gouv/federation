import { IsObject, IsString, MinLength } from 'class-validator';

import { BaseIdentityDto } from '@fc/core/dto/base-identity.dto';

import { IsPhoneNumberSimpleValidator } from '../validators/is-phone-number-simple-validator.validator';
import { IsSiret } from '../validators/is-siret-validator';

export class IdentityForSpDto extends BaseIdentityDto {
  @MinLength(1, { groups: ['siret'] })
  @IsSiret({ groups: ['siret'] })
  declare siret: string;

  @MinLength(1, { groups: ['phone_number'] })
  @IsPhoneNumberSimpleValidator({ groups: ['phone_number'] })
  declare phone_number?: string;

  @IsObject()
  custom: {
    [key: string]: unknown;
  };

  @IsString()
  idp_id: string;

  @IsString()
  idp_acr: string;
}
