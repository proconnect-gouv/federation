import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';

import { IdentityForSpDto } from '../identity-for-sp.dto';
import { IdentityFromIdpDto } from '../identity-from-idp.dto';
import { AfterRedirectToIdpWithIdpIdSessionDto } from './after-redirect-to-idp-with-idp-id-session.dto';

export class AfterGetOidcCallbackSessionDto extends AfterRedirectToIdpWithIdpIdSessionDto {
  @IsDefined()
  declare idpIdToken: string;

  @IsDefined()
  declare idpAcr: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => IdentityFromIdpDto)
  declare idpIdentity: IdentityFromIdpDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => IdentityForSpDto)
  declare spIdentity: IdentityForSpDto;
}
