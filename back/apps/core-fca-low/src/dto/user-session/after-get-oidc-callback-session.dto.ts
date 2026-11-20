import { Type } from "class-transformer";
import { IsDefined, ValidateIf, ValidateNested } from "class-validator";
import { IdentityForSpDto } from "../identity-for-sp.dto";
import { IdentityFromIdpDto } from "../identity-from-idp.dto";
import { AfterRedirectToIdpWithEmailSessionDto } from "./after-redirect-to-idp-with-email-session.dto";

export class AfterGetOidcCallbackSessionDto extends AfterRedirectToIdpWithEmailSessionDto {
  @IsDefined()
  declare idpId: string;

  @IsDefined()
  declare idpName: string;

  @IsDefined()
  declare idpLabel: string;

  // A cross-device authenticated session has no IdP token of its own
  @ValidateIf(({ isCrossDeviceAuthenticated }) => !isCrossDeviceAuthenticated)
  @IsDefined()
  declare idpIdToken: string;

  @IsDefined()
  declare idpAcr: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => IdentityFromIdpDto)
  declare idpIdentity: IdentityFromIdpDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => IdentityForSpDto)
  declare spIdentity: IdentityForSpDto;
}
