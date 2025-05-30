import { Expose } from 'class-transformer';
import { IsObject, IsString } from 'class-validator';

import { IsPhoneNumberFca } from '../validators/is-phone-number-fca.validator';
import { IsSiret } from '../validators/is-siret-validator';
import { IdentityFromIdpDto } from './identity-from-idp.dto';

export class IdentityForSpDto extends IdentityFromIdpDto {
  @IsSiret({ groups: ['siret'] })
  // By inheritance from IdentityFromIdpDto, siret is optional.
  // We cannot override this optional behavior through class-transformer.
  // Instead, siret is enforced as required via the sanitizer.
  siret: string;

  @IsPhoneNumberFca({ groups: ['phone_number'] })
  phone_number?: string;

  @IsObject()
  @Expose()
  custom: {
    [key: string]: unknown;
  };

  @IsString()
  idp_id: string;

  @IsString()
  idp_acr: string;
}
