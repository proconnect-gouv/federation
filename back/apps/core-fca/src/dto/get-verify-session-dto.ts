import { IsDefined } from 'class-validator';

import { IOidcIdentity } from '@fc/oidc';

export class GetVerifySessionDto {
  @IsDefined()
  readonly idpId: string;

  @IsDefined()
  readonly idpName: string;

  @IsDefined()
  readonly idpLabel: string;

  @IsDefined()
  readonly idpIdentity: Partial<IOidcIdentity>;
}
