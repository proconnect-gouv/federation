import { IsDefined } from 'class-validator';

import { UserSession } from '@fc/core/dto/user-session/user-session.dto';

export class GetOidcCallbackSessionDto extends UserSession {
  @IsDefined()
  declare idpId: string;

  @IsDefined()
  declare idpName: string;

  @IsDefined()
  declare idpLabel: string;

  @IsDefined()
  declare idpState: string;

  @IsDefined()
  declare idpNonce: string;
}
