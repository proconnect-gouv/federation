import { Type } from "class-transformer";
import {
  IsArray,
  IsAscii,
  IsJWT,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";

import { type IDToken } from "openid-client";

export class ClaimsDto {
  @IsString()
  @IsOptional()
  acr?: string;

  // Specific to MS Entra ID's authentication contexts
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  readonly acrs?: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  readonly amr?: string[];
}

export class TokenDto {
  @IsString()
  @MinLength(1)
  @IsAscii()
  readonly accessToken!: string;

  @IsString()
  @MinLength(1)
  @IsJWT()
  readonly idToken!: string;

  @IsObject()
  @ValidateNested()
  // Only the amr and acr claims need to be validated
  @Type(() => ClaimsDto)
  readonly claims!: IDToken & ClaimsDto;
}
