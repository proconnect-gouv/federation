import { IsAscii, IsString } from 'class-validator';

import { CrsfToken } from '@fc/oidc-client';

export class PostIdentityProviderSelectionDto extends CrsfToken {
  @IsString()
  @IsAscii()
  readonly identityProviderUid: string;
}
