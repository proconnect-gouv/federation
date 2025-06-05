import { IsObject, IsString } from 'class-validator';

import { IsPhoneNumberSimpleValidator } from '../validators/is-phone-number-simple-validator.validator';
import { IsSiret } from '../validators/is-siret-validator';
import { BaseIdentityDto } from './base-identity.dto';

export class IdentityForSpDto extends BaseIdentityDto {
  @IsSiret({ groups: ['siret'] })
  siret: string;

  @IsPhoneNumberSimpleValidator({ groups: ['phone_number'] })
  phone_number?: string;

  @IsObject()
  custom: {
    [key: string]: unknown;
  };

  @IsString()
  idp_id: string;

  @IsString()
  idp_acr: string;
}
