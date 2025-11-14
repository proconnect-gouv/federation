import {
  IsDefined,
  IsObject,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IsPhoneNumberSimpleValidator } from '../validators/is-phone-number-simple-validator.validator';
import { IsSiret } from '../validators/is-siret-validator';
import { IdentityFromIdpDto } from './identity-from-idp.dto';

export class IdentityForSpDto extends IdentityFromIdpDto {
  @IsDefined({ groups: ['siret'] })
  @MinLength(1, { groups: ['siret'] })
  @IsSiret({ groups: ['siret'] })
  declare siret: string;

  @IsString({ groups: ['phone_number'] })
  @MinLength(1, { groups: ['phone_number'] })
  @MaxLength(256, { groups: ['phone_number'] })
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
