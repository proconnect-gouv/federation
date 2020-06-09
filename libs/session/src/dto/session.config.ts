/* istanbul ignore file */

import {
  IsString,
  Length,
  MinLength,
  IsBoolean,
  IsIn,
  IsNumber,
  ValidateNested,
  IsArray,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CookieOptions {
  @IsBoolean()
  readonly signed: boolean;

  @IsString()
  @IsIn(['Strict', 'Lax', 'None'])
  readonly sameSite: 'Strict' | 'Lax' | 'None';

  @IsBoolean()
  readonly httpOnly: boolean;

  @IsBoolean()
  readonly secure: boolean;

  @IsNumber()
  @IsPositive()
  readonly maxAge: number;

  @IsString()
  readonly domain: string;
}
export class SessionConfig {
  /**
   * @TODO evaluate the opportunity to use keyObjects
   * instead of plain string + rotation of keys
   */
  @IsString()
  @Length(32, 32)
  readonly cryptographyKey: string;

  @IsString()
  @MinLength(2)
  readonly prefix: string;

  @ValidateNested()
  @Type(() => CookieOptions)
  readonly cookieOptions: CookieOptions;

  @IsString()
  readonly sessionCookieName: string;

  @IsArray()
  readonly cookieSecrets: string[];

  /**
   * @TODO this is not a generic need
   * see how to refactor this... (low priority)
   */
  @IsString()
  readonly interactionCookieName: string;

  @IsNumber()
  @IsPositive()
  readonly lifetime: number;
}
