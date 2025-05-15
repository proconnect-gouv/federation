import { IsDefined } from 'class-validator';

import { IOidcIdentity } from '@fc/oidc';

export class GetLoginSessionDto {
  @IsDefined()
  readonly accountId: string;

  @IsDefined()
  readonly idpId: string;

  @IsDefined()
  readonly idpName: string;

  @IsDefined()
  readonly idpLabel: string;

  @IsDefined()
  readonly idpIdentity?: Partial<IOidcIdentity>;

  @IsDefined()
  readonly spIdentity: IOidcIdentity;
}
