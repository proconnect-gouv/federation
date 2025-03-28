import { IsDefined } from 'class-validator';

import { PartialExcept } from '@fc/common';

import { IAgentIdentityWithPublicness } from '../interfaces';

export class GetVerifySessionDto {
  @IsDefined()
  readonly idpId: string;

  @IsDefined()
  readonly idpName: string;

  @IsDefined()
  readonly idpLabel: string;

  @IsDefined()
  readonly idpIdentity:
    | PartialExcept<IAgentIdentityWithPublicness, 'sub'>
    | IAgentIdentityWithPublicness;
}
