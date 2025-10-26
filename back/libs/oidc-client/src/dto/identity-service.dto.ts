import { Type } from 'class-transformer';
import {
  IsArray,
  IsAscii,
  IsJWT,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IdTokenClaims } from 'openid-client';

import { TokenResults } from '../interfaces';

export class TokenResultClaimsDto {
  @IsString()
  @IsOptional()
  readonly acr?: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  readonly amr?: string[];
}

export class TokenResultDto implements TokenResults {
  @IsString()
  @MinLength(1)
  @IsAscii()
  readonly accessToken: string;

  @IsString()
  @MinLength(1)
  @IsJWT()
  readonly idToken: string;

  @IsString()
  @MinLength(1)
  @IsAscii()
  @IsOptional()
  readonly refreshToken?: string;

  @IsObject()
  @ValidateNested()
  // Only the amr and acr claims need to be validated
  @Type(() => TokenResultClaimsDto)
  readonly claims: IdTokenClaims;
}
