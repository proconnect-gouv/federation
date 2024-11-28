import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { RouteInfo, Type as Class } from '@nestjs/common/interfaces';

import { IsStringOrRegExp } from '@fc/common';

import { SameSiteType, TemplateExposedType } from '../types';

export class CookieOptions {
  @IsBoolean()
  readonly signed: boolean;

  @IsString()
  @IsIn(['strict', 'lax', 'none'])
  readonly sameSite: SameSiteType;

  @IsBoolean()
  readonly httpOnly: boolean;

  @IsBoolean()
  readonly secure: boolean;

  @IsNumber()
  @IsOptional()
  readonly maxAge?: number;

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
  readonly encryptionKey: string;

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

  @IsNumber()
  @IsPositive()
  readonly lifetime: number;

  @IsNumber()
  @Min(32)
  readonly sessionIdLength: number;

  @IsArray()
  @IsStringOrRegExp({ each: true })
  readonly middlewareIncludedRoutes: (string | RouteInfo)[];

  @IsArray()
  @IsStringOrRegExp({ each: true })
  readonly middlewareExcludedRoutes: (string | RouteInfo)[];

  @IsObject()
  @IsOptional()
  readonly templateExposed?: TemplateExposedType;

  @IsBoolean()
  readonly slidingExpiration: boolean;

  @IsObject()
  readonly schema: Class<unknown>;

  @IsObject()
  readonly defaultData: Record<string, unknown>;
}
