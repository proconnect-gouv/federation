import { IsDefined } from 'class-validator';

import { AfterRedirectToIdpWithEmailSessionDto } from './after-redirect-to-idp-with-email-session.dto';

export class AfterRedirectToIdpWithIdpIdSessionDto extends AfterRedirectToIdpWithEmailSessionDto {
  @IsDefined()
  declare idpId: string;

  @IsDefined()
  declare idpName: string;

  @IsDefined()
  declare idpLabel: string;

  @IsDefined()
  declare idpNonce: string;

  @IsDefined()
  declare idpState: string;
}
