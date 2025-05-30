import { IsDefined } from 'class-validator';

import { IdentityFromIdpDto } from './identity-from-idp.dto';

export class GetVerifySessionDto {
  @IsDefined()
  readonly idpId: string;

  @IsDefined()
  readonly idpName: string;

  @IsDefined()
  readonly idpLabel: string;

  @IsDefined()
  readonly idpIdentity: Partial<IdentityFromIdpDto>;
}
