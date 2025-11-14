import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';

import { IdentityFromIdpDto } from '../identity-from-idp.dto';
import { UserSession } from './user-session.dto';

export class GetVerifySessionDto extends UserSession {
  @IsDefined()
  declare idpId: string;

  @IsDefined()
  declare idpName: string;

  @IsDefined()
  declare idpLabel: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => IdentityFromIdpDto)
  declare idpIdentity: IdentityFromIdpDto;
}
