import { Type } from "class-transformer";
import { IsDefined, IsEmpty, ValidateNested } from "class-validator";
import { IdentityForSpDto } from "../identity-for-sp.dto";
import { IdentityFromIdpDto } from "../identity-from-idp.dto";
import { ActiveUserSessionDto } from "./active-user-session.dto";

// A session can review a cross-device authentication request, unless it was
// itself obtained through one.
// Only the validators declared by the last class of a DTO hierarchy are
// applied, so the properties used to review a request and to share the
// session are declared again here.
export class ReviewerSessionDto extends ActiveUserSessionDto {
  @IsDefined()
  declare browsingSessionId: string;

  @IsDefined()
  declare idpId: string;

  @IsDefined()
  declare idpName: string;

  @IsDefined()
  declare idpLabel: string;

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

  @IsDefined()
  declare interactionAcr: string;

  @IsEmpty()
  declare isCrossDeviceAuthenticated?: boolean;
}
