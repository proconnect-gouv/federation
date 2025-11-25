import { IsDefined } from 'class-validator';

import { AfterGetOidcCallbackSessionDto } from './after-get-oidc-callback-session.dto';

export class ActiveUserSessionDto extends AfterGetOidcCallbackSessionDto {
  @IsDefined()
  declare interactionAcr: string;
}
