import { IsDefined } from 'class-validator';

import { PartialExcept } from '@fc/common';
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
  readonly idpIdentity?: PartialExcept<IOidcIdentity, 'sub'> | IOidcIdentity;

  @IsDefined()
  readonly spIdentity: IOidcIdentity;
}
