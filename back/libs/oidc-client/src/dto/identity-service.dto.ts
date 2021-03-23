import {
  IsAlphanumeric,
  IsAscii,
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
  @IsAlphanumeric()
  readonly acr: string;

  @IsString({ each: true })
  @IsOptional()
  readonly amr?: string[];
}
