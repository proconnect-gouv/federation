/* istanbul ignore file */

// Declarative code
import {
  IsArray,
  IsNumber,
  IsObject,
  IsPositive,
  ValidateNested,
  IsString,
  MinLength,
  IsOptional,
  Min,
} from 'class-validator';
import { ClientMetadata } from 'openid-client';
import { JSONWebKeySet } from 'jose';
import { Type } from 'class-transformer';

class HttpOptions {
  @IsString()
  @MinLength(1)
  readonly key: string;

  @IsString()
  @MinLength(1)
  readonly cert: string;
}

export class OidcClientConfig {
  @IsArray()
  @IsOptional()
  readonly providers?: ClientMetadata[];

  @ValidateNested()
  @Type(() => HttpOptions)
  readonly httpOptions: HttpOptions;

  @IsNumber()
  @IsPositive()
  readonly reloadConfigDelayInMs: number;

  /**
   * @TODO #143 validate the structure of JSONWebKeySet
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/143
   */
  @IsObject()
  readonly jwks: JSONWebKeySet;

  @IsNumber()
  @Min(16)
  readonly stateLength: number;
}
