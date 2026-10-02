import { IsDefined } from "class-validator";
import { AfterRedirectToIdpWithIdpIdSessionDto } from "./after-redirect-to-idp-with-idp-id-session.dto";

export class AfterRedirectToRieWarningSessionDto extends AfterRedirectToIdpWithIdpIdSessionDto {
  @IsDefined()
  declare idpAuthorizationUrl: string;
}
