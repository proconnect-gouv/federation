import { Type } from "class-transformer";
import { Equals, IsDefined, ValidateNested } from "class-validator";
import { IdentityForSpDto } from "../identity-for-sp.dto";
import { IdentityFromIdpDto } from "../identity-from-idp.dto";
import { UserSession } from "./user-session.dto";

// What a session needs to review a cross-device authentication request and to
// be shared with its requester. A session obtained through such a request
// cannot review another one.
export class ReviewerSessionDto extends UserSession {
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

  @Equals(false)
  declare isCrossDeviceAuthenticated?: boolean;
}
