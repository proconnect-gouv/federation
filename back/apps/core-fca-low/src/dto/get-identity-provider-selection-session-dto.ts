import { IsDefined } from 'class-validator';

import { UserSession } from '@fc/core/dto/user-session.dto';

export class GetIdentityProviderSelectionSessionDto extends UserSession {
  @IsDefined()
  declare idpLoginHint: string;
}
