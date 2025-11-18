import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';

import { IdentityForSpDto } from '../identity-for-sp.dto';
import { IdentityFromIdpDto } from '../identity-from-idp.dto';
import { UserSession } from './user-session.dto';

export class ActiveUserSessionDto extends UserSession {
  @IsDefined()
  @ValidateNested()
  @Type(() => IdentityForSpDto)
  declare spIdentity: IdentityForSpDto;

  @IsDefined()
  declare idpId: string;

  @IsDefined()
  declare idpName: string;

  @IsDefined()
  declare idpLabel: string;

  @IsDefined()
  declare idpIdToken: string;

  @IsDefined()
  declare idpIdentity: IdentityFromIdpDto;
}
