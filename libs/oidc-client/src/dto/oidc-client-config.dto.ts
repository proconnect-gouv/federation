/* istanbul ignore file */

// Declarative code
import {
  IsArray,
  IsNumber,
  IsObject,
  ValidateNested,
  IsOptional,
  Min,
  IsString,
  MinLength,
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

  @IsNumber()
  readonly timeout: number;
}

export class OidcClientConfig {
  @IsArray()
  @IsOptional()
  readonly providers?: ClientMetadata[];

  @ValidateNested()
  @Type(() => HttpOptions)
  readonly httpOptions: HttpOptions;

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
