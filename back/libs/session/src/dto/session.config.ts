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
  Min,
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
   * @TODO #151 evaluate the opportunity to use keyObjects
   * instead of plain string + rotation of keys
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/151
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
   * @TODO #149 this is not a generic need
   * see how to refactor this... (low priority)
   * https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/149
   */
  @IsString()
  readonly interactionCookieName: string;

  @IsNumber()
  @IsPositive()
  readonly lifetime: number;

  @IsNumber()
  @Min(32)
  readonly sessionIdLength: number;
}
