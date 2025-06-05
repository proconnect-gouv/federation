import { IsDefined } from 'class-validator';

import { IdentityForSpDto } from './identity-for-sp.dto';
import { IdentityFromIdpDto } from './identity-from-idp.dto';

export class ActiveUserSessionDto {
  @IsDefined()
  readonly accountId: string;

  @IsDefined()
  readonly spIdentity: IdentityForSpDto;

  @IsDefined()
  readonly idpId: string;

  @IsDefined()
  readonly idpName: string;

  @IsDefined()
  readonly idpLabel: string;

  @IsDefined()
  readonly idpIdToken: string;

  @IsDefined()
  readonly idpIdentity: IdentityFromIdpDto;
}
