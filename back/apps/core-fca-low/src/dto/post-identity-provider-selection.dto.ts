import { CrsfToken } from "@fc/oidc-client";
import { IsAscii, IsString } from "class-validator";

export class PostIdentityProviderSelectionDto extends CrsfToken {
  @IsString()
  @IsAscii()
  readonly identityProviderUid: string;
}
