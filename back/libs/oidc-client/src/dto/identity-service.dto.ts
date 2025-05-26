import {
  IsArray,
  IsAscii,
  IsJWT,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { TokenResults } from '../interfaces';

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

  @IsString()
  @IsOptional()
  readonly acr?: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  readonly amr?: string[];

  @IsString({ each: true })
  @IsOptional()
  readonly idpRepresentativeScope?: string[];
}
