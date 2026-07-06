import { IsAscii, IsString } from "class-validator";

export class PostIdentityProviderSelectionDto {
  @IsString()
  @IsAscii()
  readonly identityProviderUid!: string;

  @IsString()
  @IsAscii()
  readonly csrfToken!: string;
}
