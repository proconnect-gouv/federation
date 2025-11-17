import { IsDefined } from 'class-validator';

import { AfterGetInteractionSessionDto } from './after-get-interaction-session.dto';

export class AfterRedirectToIdpWithEmailSessionDto extends AfterGetInteractionSessionDto {
  @IsDefined()
  declare rememberMe: boolean;

  @IsDefined()
  declare idpLoginHint: string;
}
